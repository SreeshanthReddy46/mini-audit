from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_security_headers_present_on_response():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert "strict-origin-when-cross-origin" in response.headers.get("Referrer-Policy", "")


def test_request_id_middleware_generates_and_propagates_id():
    response = client.get("/api/health")
    req_id = response.headers.get("X-Request-ID")
    assert req_id is not None
    assert req_id.startswith("req_")

    custom_id = "evaluator-audit-trace-999"
    response_custom = client.get("/api/health", headers={"X-Request-ID": custom_id})
    assert response_custom.headers.get("X-Request-ID") == custom_id


def test_standardized_error_envelope_format():
    response = client.get("/api/non-existent-route-for-testing")
    assert response.status_code == 404

    data = response.json()
    assert "error" in data
    assert "code" in data["error"]
    assert "message" in data["error"]
    assert "request_id" in data["error"]
