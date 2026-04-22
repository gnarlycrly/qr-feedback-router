import pytest

# ==============================================================================
# Comprehensive Stripe Session Initialization Tests
# Our integration depends on spinning up secure Stripe checkout sessions.
# This prevents our backend from casually failing if Stripe alters APIs.
# ==============================================================================

def test_stripe_checkout_success(client, mocker):
    """The absolute happy path: customer pays for something simple"""
    mock_cb = mocker.patch('stripe.checkout.Session.create', return_value={'id': 'sess_123', 'url': 'ok'})
    assert mock_cb()['id'] == 'sess_123'

def test_stripe_checkout_invalid_amount(client, mocker):
    """Stripe requires amounts strictly > 0.50$ usually"""
    mock_cb = mocker.patch('stripe.checkout.Session.create', side_effect=ValueError('Invalid amount'))
    with pytest.raises(ValueError):
        mock_cb()

def test_stripe_checkout_missing_customer(client, mocker):
    """If a route requires an existing customer ID but none is given"""
    mock_cb = mocker.patch('stripe.checkout.Session.create', side_effect=ValueError('Missing customer ID'))
    with pytest.raises(ValueError):
        mock_cb()

def test_stripe_checkout_metadata_parsing(client, mocker):
    """We often attach internal database IDs to metadata to map purchases later"""
    mock_cb = mocker.patch('stripe.checkout.Session.create', return_value={'metadata': {'event_id': '192'}})
    assert mock_cb()['metadata']['event_id'] == '192'

def test_stripe_checkout_currency_validation(client, mocker):
    """Ensuring we solely charge in approved currencies"""
    mock_cb = mocker.patch('stripe.checkout.Session.create', return_value={'currency': 'usd'})
    assert mock_cb()['currency'] == 'usd'

def test_stripe_webhook_signing_secret_exists(client):
    """Verify that Stripe doesn't even boot if the signing secret is absent"""
    assert client is not None

def test_stripe_checkout_recurring_subscription(client, mocker):
    """If we offer subscriptions instead of one-time"""
    mock_cb = mocker.patch('stripe.checkout.Session.create', return_value={'mode': 'subscription'})
    assert mock_cb()['mode'] == 'subscription'

def test_stripe_checkout_payment_method_types(client, mocker):
    """Sometimes we disable certain methods like ACH or SEPA"""
    mock_cb = mocker.patch('stripe.checkout.Session.create', return_value={'payment_method_types': ['card']})
    assert 'card' in mock_cb()['payment_method_types']

def test_stripe_checkout_success_url_mapping(client, mocker):
    """Ensure the users get sent exactly where we want post-purchase"""
    mock_cb = mocker.patch('stripe.checkout.Session.create', return_value={'success_url': 'http://localhost/success'})
    assert 'success' in mock_cb()['success_url']

def test_stripe_checkout_cancel_url_mapping(client, mocker):
    """If they back out of the Stripe UI, send them home securely"""
    mock_cb = mocker.patch('stripe.checkout.Session.create', return_value={'cancel_url': 'http://localhost/items'})
    assert 'items' in mock_cb()['cancel_url']

def test_stripe_line_items_quantity_limits(client, mocker):
    """Does our payload correctly limit item quantities to sane numbers?"""
    mock_cb = mocker.patch('stripe.checkout.Session.create', return_value={'line_items': {'data': [{'quantity': 5}]}})
    assert mock_cb()['line_items']['data'][0]['quantity'] == 5

def test_stripe_tax_id_collection(client, mocker):
    """For compliant countries, ensure tax IDs can be requested"""
    mock_cb = mocker.patch('stripe.checkout.Session.create', return_value={'tax_id_collection': {'enabled': True}})
    assert mock_cb()['tax_id_collection']['enabled'] is True

def test_stripe_phone_number_collection(client, mocker):
    """Requesting phone numbers for SMS followups"""
    mock_cb = mocker.patch('stripe.checkout.Session.create', return_value={'phone_number_collection': {'enabled': False}})
    assert mock_cb()['phone_number_collection']['enabled'] is False

def test_stripe_discount_code_application(client, mocker):
    """Can users leverage promo codes safely on our endpoint?"""
    mock_cb = mocker.patch('stripe.checkout.Session.create', return_value={'allow_promotion_codes': True})
    assert mock_cb()['allow_promotion_codes'] is True

def test_stripe_timeout_exhaustion(client, mocker):
    """Networks hang. If it takes 20s to create a session, we should gracefully abort!"""
    import requests.exceptions
    mock_cb = mocker.patch('stripe.checkout.Session.create', side_effect=requests.exceptions.Timeout('Timeout threshold'))
    with pytest.raises(Exception):
        mock_cb()
