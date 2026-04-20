import os
import firebase_admin
from firebase_admin import credentials

FIREBASE_KEY_PATH = os.getenv("FIREBASE_KEY_PATH")

if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_KEY_PATH)
    firebase_admin.initialize_app(cred)

from stripe_routes import (
    _json_response,
    create_checkout_session,
    create_portal_session,
    webhook,
)


def _normalize_path(event):
    path = event.get("rawPath") or event.get("path") or "/"
    path = path.rstrip("/") or "/"

    stage = (event.get("requestContext", {}) or {}).get("stage")
    if stage and stage != "$default":
        prefix = f"/{stage}"
        if path == prefix:
            path = "/"
        elif path.startswith(prefix + "/"):
            path = path[len(prefix):] or "/"

    base_prefix = "/stripe-backend"
    if path == base_prefix:
        return "/"
    if path.startswith(base_prefix + "/"):
        return path[len(base_prefix):]

    return path


def lambda_handler(event, context):
    print("LAMBDA HANDLER STARTED")
    path = _normalize_path(event)
    method = (
        event.get("requestContext", {}).get("http", {}).get("method")
        or event.get("httpMethod", "")
    )

    headers = event.get("headers", {}) or {}
    origin = headers.get("origin") or headers.get("Origin") or os.getenv("FRONTEND_URL", "http://localhost:5173")

    if method == "OPTIONS":
        return _json_response(200, {"ok": True}, origin)
    
    if path in ("", "/") and method == "GET":
        return _json_response(200, {"message": "QR Feedback is running!"}, origin)

    if path == "/api/stripe/create-checkout-session" and method == "POST":
        return create_checkout_session(event)

    if path == "/api/stripe/create-portal-session" and method == "POST":
        return create_portal_session(event)

    if path == "/api/stripe/webhook" and method == "POST":
        return webhook(event)
    
    return _json_response(404, {
        "error": "Not found",
        "path_seen": path,
        "method_seen": method,
        "stage_seen": (event.get("requestContext", {}) or {}).get("stage"),
        "rawPath_seen": event.get("rawPath"),
        "routeKey_seen": event.get("routeKey"),
}, origin)

    