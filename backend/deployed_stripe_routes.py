import os
import json
import base64
import stripe
from firebase_admin import auth as firebase_auth, firestore

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
PRICE_MONTHLY = os.getenv("STRIPE_PRICE_ID_MONTHLY")
PRICE_YEARLY = os.getenv("STRIPE_PRICE_ID_YEARLY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

db = firestore.client()


def _json_response(status_code, body, origin=None):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": origin or FRONTEND_URL,
            "Access-Control-Allow-Headers": "Content-Type,Authorization,Stripe-Signature",
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
        },
        "body": json.dumps(body),
    }


def _get_header(headers, name):
    if not headers:
        return None
    for key, value in headers.items():
        if key.lower() == name.lower():
            return value
    return None


def _get_origin(headers):
    origin = _get_header(headers, "Origin")
    return origin or FRONTEND_URL


def _get_raw_body(event):
    body = event.get("body", b"")
    if event.get("isBase64Encoded", False):
        return base64.b64decode(body)
    if isinstance(body, str):
        return body.encode("utf-8")
    return body


def _get_json_body(event):
    raw = _get_raw_body(event)
    if not raw:
        return {}
    return json.loads(raw.decode("utf-8"))


def _verify_firebase_token(event):
    """Extract and verify the Firebase ID token from the Authorization header."""
    headers = event.get("headers", {}) or {}
    header = _get_header(headers, "Authorization") or ""
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


def create_checkout_session(event):
    origin = _get_origin(event.get("headers", {}) or {})

    decoded = _verify_firebase_token(event)
    if not decoded:
        return _json_response(401, {"error": "Unauthorized"}, origin)

    uid = decoded["uid"]
    business_id = _get_business_id(uid)
    if not business_id:
        return _json_response(404, {"error": "No business found"}, origin)

    data = _get_json_body(event) or {}
    plan = data.get("plan", "monthly")
    use_trial = data.get("trial", False)

    price_id = PRICE_YEARLY if plan == "yearly" else PRICE_MONTHLY
    if not price_id:
        return _json_response(500, {"error": "Price not configured"}, origin)

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
        return _json_response(200, {"url": session.url}, origin)
    except stripe.error.StripeError as e:
        return _json_response(400, {"error": str(e)}, origin)


def create_portal_session(event):
    origin = _get_origin(event.get("headers", {}) or {})

    decoded = _verify_firebase_token(event)
    if not decoded:
        return _json_response(401, {"error": "Unauthorized"}, origin)

    uid = decoded["uid"]
    business_id = _get_business_id(uid)
    if not business_id:
        return _json_response(404, {"error": "No business found"}, origin)

    business_doc = db.collection("businesses").document(business_id).get()
    business_data = business_doc.to_dict() or {}
    stripe_customer_id = business_data.get("subscription", {}).get("stripeCustomerId")

    if not stripe_customer_id:
        return _json_response(400, {"error": "No Stripe customer found"}, origin)

    try:
        session = stripe.billing_portal.Session.create(
            customer=stripe_customer_id,
            return_url=f"{FRONTEND_URL}/account",
        )
        return _json_response(200, {"url": session.url}, origin)
    except stripe.error.StripeError as e:
        return _json_response(400, {"error": str(e)}, origin)


def webhook(event):
    origin = _get_origin(event.get("headers", {}) or {})

    payload = _get_raw_body(event)
    sig_header = _get_header(event.get("headers", {}) or {}, "Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
        # print("Webhook verified successfully")
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        # print("Webhook verification failed:", e)
        return _json_response(400, {"error": "Invalid signature"}, origin)

    event_type = event["type"]
    data_object = event["data"]["object"]

    try:
        if event_type == "checkout.session.completed":
            _handle_checkout_completed(data_object)
        elif event_type in (
            "customer.subscription.updated",
            "customer.subscription.deleted",
        ):
            _handle_subscription_change(data_object)
    except Exception as e:
        # print("Webhook handler error:", e)
        return _json_response(500, {"error": str(e)}, origin)

    return _json_response(200, {"received": True}, origin)


def _handle_checkout_completed(session):
    print("--- HANDLE CHECKOUT ENTERED ---")

    metadata = session["metadata"] if "metadata" in session else {}
    business_id = metadata["businessId"] if metadata and "businessId" in metadata else None

    customer_id = session["customer"] if "customer" in session else None
    subscription_id = session["subscription"] if "subscription" in session else None

    # print("business_id:", business_id)
    # print("customer_id:", customer_id)
    # print("subscription_id:", subscription_id)

    print("REACHED 1")

    if not business_id:
        print("No business_id in metadata")
        return

    if not subscription_id:
        print("No subscription_id on session")
        return

    print("REACHED 2")

    sub = stripe.Subscription.retrieve(subscription_id)

    print("REACHED 3")

    print("checkout.session.completed received")
    print("metadata:", metadata)
    print("business_id:", business_id)
    print("customer_id:", customer_id)
    print("subscription_id:", subscription_id)
    print("about to update Firestore")

    db.collection("businesses").document(business_id).update({
        "subscription": {
            "status": sub["status"],
            "plan": "pro",
            "stripeCustomerId": customer_id,
            "stripeSubscriptionId": subscription_id,
            "currentPeriodEnd": sub["current_period_end"] if "current_period_end" in sub else None,
            "cancelAtPeriodEnd": sub["cancel_at_period_end"] if "cancel_at_period_end" in sub else False,
        }
    })


def _handle_subscription_change(subscription):
    """Handle subscription updates (renewals, cancellations, payment failures)."""
    customer_id = subscription["customer"] if "customer" in subscription else None
    if not customer_id:
        print("No customer_id on subscription event")
        return

    # Find business by stripeCustomerId
    docs = db.collection("businesses").where("subscription.stripeCustomerId", "==", customer_id).limit(1).stream()
    business_id = None
    for doc in docs:
        business_id = doc.id
        break

    if not business_id:
        # print("No business found for customer_id:", customer_id)
        return

    status = subscription["status"] if "status" in subscription else "canceled"
    cancel_at_period_end = subscription["cancel_at_period_end"] if "cancel_at_period_end" in subscription else False
    current_period_end = subscription["current_period_end"] if "current_period_end" in subscription else None

    # Map Stripe status to our plan
    plan = "free" if status in ("canceled", "unpaid") else "pro"

    db.collection("businesses").document(business_id).update({
        "subscription.status": status,
        "subscription.plan": plan,
        "subscription.currentPeriodEnd": current_period_end,
        "subscription.cancelAtPeriodEnd": cancel_at_period_end,
    })

'''
[
  {
    "source": "/<*>",
    "status": "200",
    "target": "/index.html"
  }
]
'''
