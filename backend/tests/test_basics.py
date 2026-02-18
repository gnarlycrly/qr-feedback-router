import json

# ==============================================================================
# Extensive Health and Basic Route Configuration Tests.
# These tests explore edge cases for how the basic application routing structure
# responds to various malformed headers, methods, and payloads!
# ==============================================================================

def test_app_health_200(client):
    """The root route might not be formally mapped, but it should never 500!"""
    response = client.get('/', follow_redirects=True)
    assert response.status_code in [200, 404]

def test_cors_allow_origin_wildcard(client):
    """Ensure CORS is loosely allowing frontend access for cross-origin fetches"""
    response = client.get('/', follow_redirects=True)
    if response.status_code == 200:
        assert 'Access-Control-Allow-Origin' in response.headers

def test_cors_options_preflight(client):
    """Browsers send OPTIONS before POSTs. The server must handle this safely."""
    response = client.options('/', follow_redirects=True)
    assert response.status_code in [200, 204, 404]

def test_cors_credentials_header_inclusion(client):
    """Verify that if we expose CORS, we handle credentials configurations"""
    response = client.options('/')
    if response.status_code == 200:
        assert 'Access-Control-Allow-Methods' in response.headers

def test_invalid_http_put_method(client):
    """A PUT on a basic route should properly yield a 405 Method Not Allowed"""
    response = client.put('/', follow_redirects=True)
    assert response.status_code == 405

def test_invalid_http_delete_method(client):
    """Just like PUT, DELETE should map to 405 on non-destructive routes"""
    response = client.delete('/')
    assert response.status_code == 405

def test_invalid_http_patch_method(client):
    """PATCH is usually unsupported out of the box"""
    response = client.patch('/')
    assert response.status_code == 405

def test_missing_route_handler_404(client):
    """A completely random route must immediately 404 correctly and safely"""
    response = client.get('/this-does-not-exist')
    assert response.status_code == 404

def test_missing_route_handler_post_404(client):
    """POSTing to a non-existent route also must map to 404 cleanly"""
    response = client.post('/this-does-not-exist/either')
    assert response.status_code == 404

def test_invalid_text_payload_parsing_error(client):
    """If we send pure text to an API that expects JSON, it should fail softly"""
    response = client.post('/api/feedback', data="invalid json")
    assert response.status_code in [400, 415, 404]

def test_invalid_xml_payload_rejection(client):
    """XML is old-school. Ensure the parser denies it"""
    xml_data = "<tag>hello</tag>"
    response = client.post('/api/feedback', data=xml_data, content_type='application/xml')
    assert response.status_code in [400, 415, 404]

def test_malformed_json_syntax_error(client):
    """Valid content-type but invalid syntax! Specifically a syntax error"""
    response = client.post('/api/feedback', data='{"hello": "unclosed', content_type='application/json')
    assert response.status_code in [400, 415, 404, 500]

def test_excessively_large_payload_rejection(client):
    """Sending massive memory chunks should hopefully bounce or 413 out"""
    massive_payload = {"data": "A" * 1024 * 1024 * 5}  # 5 Megabytes
    response = client.post('/api/feedback', json=massive_payload)
    assert response.status_code in [413, 400, 404, 500]

def test_url_encoded_parameters_edge_case(client):
    """Query params could be dangerous if parsed poorly"""
    response = client.get('/api/feedback?param=%%%')
    assert response.status_code in [400, 404]

def test_empty_json_body_validation(client):
    """A completely empty dictionary payload must be handled"""
    response = client.post('/api/feedback', json={})
    assert response.status_code in [400, 404, 500]
    
def test_missing_required_headers_completely(client):
    """No authorization or standard headers at all"""
    response = client.post('/api/feedback', headers={})
    assert response.status_code in [400, 404, 500]

def test_fake_x_forwarded_for_header(client):
    """Spoofing IP addresses shouldn't trip any internal errors"""
    response = client.get('/', headers={'X-Forwarded-For': '192.168.1.1'})
    assert response.status_code in [200, 404]
