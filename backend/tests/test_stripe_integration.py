import pytest
import stripe
from app import app

def test_create_checkout_session_unauthorized_drop(client):
    """If an attacker attempts to invoke Stripe creation without a JWT Bearer token"""
    response = client.post('/api/stripe/create-checkout-session', json={'plan': 'monthly'})
    assert response.status_code == 401
    assert response.json == {"error": "Unauthorized"}

def test_create_checkout_session_no_business_found(client, mocker):
    """If Firebase validates but no corresponding business entity belongs to the user"""
    # Overriding the local module utility imports!
    mocker.patch('stripe_routes._verify_firebase_token', return_value={'uid': 'fake_uid'})
    mocker.patch('stripe_routes._get_business_id', return_value=None)
    
    response = client.post(
        '/api/stripe/create-checkout-session', 
        headers={'Authorization': 'Bearer valid_jwt'}, 
        json={'plan': 'monthly'}
    )
    assert response.status_code == 404
    assert response.json == {"error": "No business found"}

def test_create_checkout_session_success_mapping(client, mocker):
    """Happy path: Validate the Stripe parameters resolve natively through our actual endpoints"""
    mocker.patch('stripe_routes._verify_firebase_token', return_value={'uid': 'fake_uid', 'email': 'x@y.z'})
    mocker.patch('stripe_routes._get_business_id', return_value='biz_123')
    
    mock_db = mocker.patch('stripe_routes.db')
    mock_doc = mocker.MagicMock()
    mock_doc.to_dict.return_value = {}
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc
    
    # We mock stripe.checkout.Session.create because we can't legitimately hit stripe.com here
    mock_stripe = mocker.patch('stripe.checkout.Session.create', return_value=mocker.MagicMock(url='http://stripe.checkout.mock', id='sess_123'))
    
    response = client.post(
        '/api/stripe/create-checkout-session', 
        headers={'Authorization': 'Bearer asdf'}, 
        json={'plan': 'monthly'}
    )
    
    # Asserting that ONLY a successful creation pushes back a 200 properly instead of an array
    assert response.status_code == 200
    assert response.json == {"url": "http://stripe.checkout.mock"}
    
    # Verify we accurately pushed the parameters into Stripe!
    assert mock_stripe.called
    kwargs = mock_stripe.call_args.kwargs
    assert kwargs['mode'] == 'subscription'
    assert 'customer_email' in kwargs
    assert kwargs['metadata']['businessId'] == 'biz_123'
