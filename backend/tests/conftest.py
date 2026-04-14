import pytest
import os
import sys
from unittest.mock import MagicMock

# ==============================================================================
# Pytest Configuration and Global Mocks
# ==============================================================================
# We set dummy environment variables so the initialization code in app.py
# doesn't immediately crash trying to look up the Firebase credentials.
# These specific paths are isolated to the test runner via pytest's lifetime.
# ==============================================================================
os.environ["FIREBASE_KEY_PATH"] = "dummy.json"
os.environ["STRIPE_API_KEY"] = "sk_test_mock123"

# ==============================================================================
# Overriding the heavily coupled network dependencies before app import:
# This prevents our test runner from making actual network calls natively
# to Firebase or Stripe while evaluating routes. 
# We achieve this by hijacking the `sys.modules` dictionary.
# ==============================================================================
sys.modules['firebase_admin'] = MagicMock()
sys.modules['firebase_admin.credentials'] = MagicMock()
sys.modules['firebase_admin.auth'] = MagicMock()
sys.modules['stripe'] = MagicMock()

# Inject the parent directory into python's path block so we can read `app`
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import our Flask app after the mocks are secured!
from app import app as flask_app

# ==============================================================================
# Primary Fixtures
# ==============================================================================
# This creates a test client that behaves identically to our live server,
# but it maintains cookies and context purely in memory. By yielding it,
# it gracefully cleans up after each test finishes executing!
@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as client:
        yield client
