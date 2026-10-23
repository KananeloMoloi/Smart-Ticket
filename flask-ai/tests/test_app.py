import os
os.environ['AI_SERVICE_TOKEN'] = 'test-token'
os.environ.pop('OPENAI_API_KEY', None)
from app import app, fallback

def test_health():
    assert app.test_client().get('/health').status_code == 200

def test_requires_token():
    assert app.test_client().post('/analyze', json={'title':'WiFi down','description':'I cannot connect to wifi at work'}).status_code == 401

def test_classification():
    response = app.test_client().post('/analyze', headers={'X-Service-Token':'test-token'}, json={'title':'WiFi down','description':'I cannot connect to the company wifi at work'})
    assert response.status_code == 200
    assert response.json['category'] == 'Network'

def test_bad_input():
    assert app.test_client().post('/analyze', headers={'X-Service-Token':'test-token'}, json={'title':'x','description':'short'}).status_code == 400

def test_security_priority():
    assert fallback('Data breach', 'We suspect a data breach occurred')['priority'] == 'CRITICAL'
