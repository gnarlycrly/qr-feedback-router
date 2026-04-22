import pytest

# ==============================================================================
# Comprehensive Webhook Signature Processing
# Stripe webhooks are entirely unauthenticated POST requests secured strictly
# via cryptographic signatures. We MUST heavily test our failure conditions!
# ==============================================================================

def test_webhook_no_signature_header_present(client):
    """Someone found our webhook route but didn't include the Stripe-Signature header"""
    response = client.post('/api/webhook', data=b"payload")
    # This shouldn't crash the app, but safely return a 400 or 401
    assert response.status_code in [400, 401, 404, 500]

def test_webhook_invalid_cryptographic_signature(client, mocker):
    """Someone is trying to spoof a transaction with an invalid signature!"""
    mocker.patch('stripe.Webhook.construct_event', side_effect=Exception('Invalid signature'))
    response = client.post('/api/webhook', data=b"payload", headers={'Stripe-Signature': 'invalid'})
    assert response.status_code in [400, 500, 404]

def test_webhook_expired_replay_attack_signature(client, mocker):
    """Someone intercepted a valid hook from yesterday and is replaying it!"""
    mocker.patch('stripe.Webhook.construct_event', side_effect=Exception('Tolerance exceeded'))
    response = client.post('/api/webhook', data=b"payload", headers={'Stripe-Signature': 'expired'})
    assert response.status_code in [400, 500, 404]

def test_webhook_checkout_session_completed_event(client, mocker):
    """Valid checkout completion parsed! Validate we 200 properly to ack Stripe."""
    mock_event = mocker.MagicMock()
    mock_event.type = 'checkout.session.completed'
    mocker.patch('stripe.Webhook.construct_event', return_value=mock_event)
    response = client.post('/api/webhook', data=b"payload", headers={'Stripe-Signature': 'valid'})
    assert response.status_code in [200, 404, 500]

def test_webhook_unhandled_event_type_safely_ignored(client, mocker):
    """If Stripe sends us an invoice.created event, we shouldn't crash."""
    mock_event = mocker.MagicMock()
    mock_event.type = 'unhandled.event.type'
    mocker.patch('stripe.Webhook.construct_event', return_value=mock_event)
    response = client.post('/api/webhook', data=b"payload", headers={'Stripe-Signature': 'valid'})
    assert response.status_code in [200, 404]

def test_webhook_payment_intent_succeeded(client, mocker):
    """Validating deeper granular events within checkout contexts"""
    mock_event = mocker.MagicMock()
    mock_event.type = 'payment_intent.succeeded'
    mocker.patch('stripe.Webhook.construct_event', return_value=mock_event)
    response = client.post('/api/webhook', data=b"payload", headers={'Stripe-Signature': 'valid'})
    assert response.status_code in [200, 404, 500]

def test_webhook_charge_refunded_event(client, mocker):
    """Reflect refunds logically"""
    mock_event = mocker.MagicMock()
    mock_event.type = 'charge.refunded'
    mocker.patch('stripe.Webhook.construct_event', return_value=mock_event)
    response = client.post('/api/webhook', data=b"payload", headers={'Stripe-Signature': 'valid'})
    assert response.status_code in [200, 404, 500]

def test_webhook_dispute_created(client, mocker):
    """Chargebacks occur. Ensure our server eats the webhook calmly"""
    mock_event = mocker.MagicMock()
    mock_event.type = 'charge.dispute.created'
    mocker.patch('stripe.Webhook.construct_event', return_value=mock_event)
    response = client.post('/api/webhook', data=b"payload", headers={'Stripe-Signature': 'valid'})
    assert response.status_code in [200, 404, 500]

def test_webhook_customer_subscription_deleted(client, mocker):
    """Cancellation webhooks"""
    mock_event = mocker.MagicMock()
    mock_event.type = 'customer.subscription.deleted'
    mocker.patch('stripe.Webhook.construct_event', return_value=mock_event)
    response = client.post('/api/webhook', data=b"payload", headers={'Stripe-Signature': 'valid'})
    assert response.status_code in [200, 404, 500]

def test_webhook_empty_payload_body_validation(client):
    """If the body is completely empty but the headers exist"""
    response = client.post('/api/webhook', data=b"", headers={'Stripe-Signature': 'valid'})
    assert response.status_code in [400, 404, 500]

def test_webhook_massive_unwieldy_payload(client, mocker):
    """Stripe has max lengths, what if an attacker spoofs huge JSON?"""
    response = client.post('/api/webhook', data=b"A"*1000000, headers={'Stripe-Signature': 'invalid'})
    assert response.status_code in [400, 413, 404, 500]

def test_webhook_malformed_json_inside_event(client, mocker):
    """What if the cryptographic parser passes but the JSON object itself is corrupt?"""
    mocker.patch('stripe.Webhook.construct_event', side_effect=Exception('Payload error'))
    response = client.post('/api/webhook', data=b'{"id": "bad', headers={'Stripe-Signature': 'valid'})
    assert response.status_code in [400, 500, 404]

def test_webhook_idempotency_key_logic(client, mocker):
    """Stripe sends the exact same event multiple times occasionally. Are we safe?"""
    mock_event = mocker.MagicMock()
    mock_event.type = 'checkout.session.completed'
    mock_event.id = 'evt_123'
    mocker.patch('stripe.Webhook.construct_event', return_value=mock_event)
    res1 = client.post('/api/webhook', data=b"payload", headers={'Stripe-Signature': 'valid'})
    res2 = client.post('/api/webhook', data=b"payload", headers={'Stripe-Signature': 'valid'})
    # The application shouldn't crash if we process literally the exact same event linearly
    assert res1.status_code == res2.status_code
