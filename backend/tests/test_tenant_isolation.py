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


def test_abc_user_can_access_own_client():
    """Firm A (ABC) user can view Firm A's client."""
    client = TestClient(app)
    token_a = get_token("aman@abc.com")
    headers_a = {"Authorization": f"Bearer {token_a}"}

    resp = client.get("/api/clients", headers=headers_a)
    assert resp.status_code == 200
    clients_a = resp.json()
    abc_client = next(c for c in clients_a if c["name"] == "ABC Traders Pvt. Ltd.")
    assert abc_client is not None

    detail_resp = client.get(f"/api/clients/{abc_client['id']}", headers=headers_a)
    assert detail_resp.status_code == 200
    assert detail_resp.json()["name"] == "ABC Traders Pvt. Ltd."


def test_tenant_isolation_abc_cannot_see_xyz_client():
    """
    CRITICAL SECURITY INVARIANT:
    Firm A user requests Firm B client ID.
    Backend MUST return 404 Not Found (never leak data or confirm existence).
    """
    client = TestClient(app)
    token_a = get_token("rohit@abc.com")
    token_b = get_token("priya@xyz.com")

    resp_b = client.get("/api/clients", headers={"Authorization": f"Bearer {token_b}"})
    assert resp_b.status_code == 200
    xyz_client = next(c for c in resp_b.json() if c["name"] == "XYZ Manufacturing Ltd.")
    xyz_client_id = xyz_client["id"]

    malicious_resp = client.get(
        f"/api/clients/{xyz_client_id}",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert malicious_resp.status_code == 404
    assert malicious_resp.json()["detail"] == "Client not found"


def test_tenant_isolation_xyz_cannot_see_abc_client():
    """
    Reverse check: Firm B user requests Firm A client ID.
    Backend MUST return 404 Not Found.
    """
    client = TestClient(app)
    token_a = get_token("rohit@abc.com")
    token_b = get_token("rahul@xyz.com")

    resp_a = client.get("/api/clients", headers={"Authorization": f"Bearer {token_a}"})
    assert resp_a.status_code == 200
    abc_client = next(c for c in resp_a.json() if c["name"] == "ABC Traders Pvt. Ltd.")
    abc_client_id = abc_client["id"]

    malicious_resp = client.get(
        f"/api/clients/{abc_client_id}",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert malicious_resp.status_code == 404
    assert malicious_resp.json()["detail"] == "Client not found"


def test_list_clients_firm_isolation():
    """Verify that listing clients returns zero items from other firms."""
    client = TestClient(app)
    token_a = get_token("aman@abc.com")
    token_b = get_token("priya@xyz.com")

    resp_a = client.get("/api/clients", headers={"Authorization": f"Bearer {token_a}"})
    names_a = [c["name"] for c in resp_a.json()]
    assert "ABC Traders Pvt. Ltd." in names_a
    assert "XYZ Manufacturing Ltd." not in names_a

    resp_b = client.get("/api/clients", headers={"Authorization": f"Bearer {token_b}"})
    names_b = [c["name"] for c in resp_b.json()]
    assert "XYZ Manufacturing Ltd." in names_b
    assert "ABC Traders Pvt. Ltd." not in names_b
