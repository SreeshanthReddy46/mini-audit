import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.seed import seed_database


@pytest.fixture(autouse=True, scope="module")
def setup_test_db():
    seed_database()


def get_token(email: str, password: str = "password123") -> str:
    client = TestClient(app)
    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    return resp.json()["access_token"]


def test_invalid_state_transition_pending_to_approved():
    """Cannot approve a document that is still in PENDING state."""
    client = TestClient(app)
    token_reviewer = get_token("aman@abc.com")
    headers_reviewer = {"Authorization": f"Bearer {token_reviewer}"}

    clients_resp = client.get("/api/clients", headers=headers_reviewer)
    abc_client = clients_resp.json()[0]
    docs_resp = client.get(f"/api/clients/{abc_client['id']}/documents", headers=headers_reviewer)
    pending_doc = next(d for d in docs_resp.json() if d["status"] == "PENDING")

    resp = client.post(f"/api/documents/{pending_doc['id']}/approve", headers=headers_reviewer)
    assert resp.status_code == 400
    assert "Cannot approve" in resp.json()["detail"]


def test_invalid_state_transition_uploaded_to_approved():
    """Cannot approve a document directly from UPLOADED without starting review."""
    client = TestClient(app)
    token_staff = get_token("rohit@abc.com")
    token_reviewer = get_token("aman@abc.com")
    headers_staff = {"Authorization": f"Bearer {token_staff}"}
    headers_reviewer = {"Authorization": f"Bearer {token_reviewer}"}

    clients_resp = client.get("/api/clients", headers=headers_staff)
    abc_client = clients_resp.json()[0]
    docs_resp = client.get(f"/api/clients/{abc_client['id']}/documents", headers=headers_staff)
    doc = next(d for d in docs_resp.json() if d["status"] == "PENDING")

    client.post(
        f"/api/documents/{doc['id']}/upload",
        files={"file": ("Purchase_Register.pdf", io.BytesIO(b"%PDF Mock Purchase"), "application/pdf")},
        headers=headers_staff
    )

    resp = client.post(f"/api/documents/{doc['id']}/approve", headers=headers_reviewer)
    assert resp.status_code == 400
    assert "Cannot approve" in resp.json()["detail"]


def test_unauthenticated_requests_rejected():
    """Requests without token are rejected across all protected endpoints."""
    client = TestClient(app)

    assert client.get("/api/clients").status_code == 401
    assert client.post("/api/clients", json={"name": "Test"}).status_code == 401
    assert client.get("/api/audit").status_code == 401
