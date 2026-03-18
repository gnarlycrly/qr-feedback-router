import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, auth
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app, origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")])
cred = credentials.Certificate(os.getenv("FIREBASE_KEY_PATH"))
firebase_admin.initialize_app(cred)
db = firestore.client()

# Register Stripe blueprint
from stripe_routes import stripe_bp
app.register_blueprint(stripe_bp)

@app.route("/")
def index():
    return jsonify({"message": "QR Feedback Flask API is running!"})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
