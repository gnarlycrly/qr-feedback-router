import os
import stripe
from flask import Blueprint, request, jsonify
from firebase_admin import auth as firebase_auth, firestore

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
PRICE_MONTHLY = os.getenv("STRIPE_PRICE_ID_MONTHLY")
PRICE_YEARLY = os.getenv("STRIPE_PRICE_ID_YEARLY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

stripe_bp = Blueprint("stripe", __name__, url_prefix="/api/stripe")
db = firestore.client()


def _verify_firebase_token(req):
    """Extract and verify the Firebase ID token from the Authorization header."""
    header = req.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    token = header.split("Bearer ")[1]
    try:
        return firebase_auth.verify_id_token(token)
    except Exception:
        return None


def _get_business_id(uid):
    """Find the business doc owned by this user."""
    docs = db.collection("businesses").where("ownerIds", "array_contains", uid).limit(1).stream()
    for doc in docs:
        return doc.id
    return None


@stripe_bp.route("/create-checkout-session", methods=["POST"])
def create_checkout_session():
    decoded = _verify_firebase_token(request)
    if not decoded:
        return jsonify({"error": "Unauthorized"}), 401

    uid = decoded["uid"]
    business_id = _get_business_id(uid)
    if not business_id:
        return jsonify({"error": "No business found"}), 404

    data = request.get_json() or {}
    plan = data.get("plan", "monthly")
    use_trial = data.get("trial", False)

    price_id = PRICE_YEARLY if plan == "yearly" else PRICE_MONTHLY
    if not price_id:
        return jsonify({"error": "Price not configured"}), 500

    # Check if business already has a Stripe customer ID
    business_doc = db.collection("businesses").document(business_id).get()
    business_data = business_doc.to_dict() or {}
    subscription = business_data.get("subscription", {})
    stripe_customer_id = subscription.get("stripeCustomerId")

    checkout_params = {
        "mode": "subscription",
        "line_items": [{"price": price_id, "quantity": 1}],
        "success_url": f"{FRONTEND_URL}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}",
        "cancel_url": f"{FRONTEND_URL}/pricing",
        "metadata": {"businessId": business_id, "firebaseUid": uid},
    }

    if use_trial:
        checkout_params["subscription_data"] = {"trial_period_days": 14}

    if stripe_customer_id:
        checkout_params["customer"] = stripe_customer_id
    else:
        checkout_params["customer_email"] = decoded.get("email")

    try:
        session = stripe.checkout.Session.create(**checkout_params)
        return jsonify({"url": session.url})
    except stripe.error.StripeError as e:
        return jsonify({"error": str(e)}), 400


@stripe_bp.route("/create-portal-session", methods=["POST"])
def create_portal_session():
    decoded = _verify_firebase_token(request)
    if not decoded:
        return jsonify({"error": "Unauthorized"}), 401

    uid = decoded["uid"]
    business_id = _get_business_id(uid)
    if not business_id:
        return jsonify({"error": "No business found"}), 404

    business_doc = db.collection("businesses").document(business_id).get()
    business_data = business_doc.to_dict() or {}
    stripe_customer_id = business_data.get("subscription", {}).get("stripeCustomerId")

    if not stripe_customer_id:
        return jsonify({"error": "No Stripe customer found"}), 400

    try:
        session = stripe.billing_portal.Session.create(
            customer=stripe_customer_id,
            return_url=f"{FRONTEND_URL}/account",
        )
        return jsonify({"url": session.url})
    except stripe.error.StripeError as e:
        return jsonify({"error": str(e)}), 400


@stripe_bp.route("/webhook", methods=["POST"])
def webhook():
    payload = request.get_data()
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        return jsonify({"error": "Invalid signature"}), 400

    event_type = event["type"]
    data_object = event["data"]["object"]

    if event_type == "checkout.session.completed":
        _handle_checkout_completed(data_object)
    elif event_type in (
        "customer.subscription.updated",
        "customer.subscription.deleted",
    ):
        _handle_subscription_change(data_object)

    return jsonify({"received": True}), 200


def _handle_checkout_completed(session):
    """After successful checkout, link Stripe customer to business and write initial subscription state."""
    business_id = session.get("metadata", {}).get("businessId")
    if not business_id:
        return

    customer_id = session.get("customer")
    subscription_id = session.get("subscription")

    if not subscription_id:
        return

    # Fetch the full subscription from Stripe to get period details
    sub = stripe.Subscription.retrieve(subscription_id)

    db.collection("businesses").document(business_id).update({
        "subscription": {
            "status": sub["status"],  # "trialing" or "active"
            "plan": "pro",
            "stripeCustomerId": customer_id,
            "stripeSubscriptionId": subscription_id,
            "currentPeriodEnd": firestore.SERVER_TIMESTAMP if not sub.get("current_period_end") else sub["current_period_end"],
            "cancelAtPeriodEnd": sub.get("cancel_at_period_end", False),
        }
    })


def _handle_subscription_change(subscription):
    """Handle subscription updates (renewals, cancellations, payment failures)."""
    customer_id = subscription.get("customer")
    if not customer_id:
        return

    # Find business by stripeCustomerId
    docs = db.collection("businesses").where("subscription.stripeCustomerId", "==", customer_id).limit(1).stream()
    business_id = None
    for doc in docs:
        business_id = doc.id
        break

    if not business_id:
        return

    status = subscription.get("status", "canceled")
    cancel_at_period_end = subscription.get("cancel_at_period_end", False)
    current_period_end = subscription.get("current_period_end")

    # Map Stripe status to our plan
    plan = "free" if status in ("canceled", "unpaid") else "pro"

    db.collection("businesses").document(business_id).update({
        "subscription.status": status,
        "subscription.plan": plan,
        "subscription.currentPeriodEnd": current_period_end,
        "subscription.cancelAtPeriodEnd": cancel_at_period_end,
    })
