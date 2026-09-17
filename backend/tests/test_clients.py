import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.seed import seed_database


@pytest.fixture(autouse=True, scope="module")
def setup_test_db():
    seed_database()


@pytest.fixture
def auth_headers_rohit():
    client = TestClient(app)
    resp = client.post(
        "/api/auth/login",
        json={"email": "rohit@abc.com", "password": "password123"}
    )
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_list_clients(auth_headers_rohit):
    client = TestClient(app)
    response = client.get("/api/clients", headers=auth_headers_rohit)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    client_names = [c["name"] for c in data]
    assert "ABC Traders Pvt. Ltd." in client_names
    abc_client = next(c for c in data if c["name"] == "ABC Traders Pvt. Ltd.")
    assert abc_client["document_count"] == 5


def test_create_client(auth_headers_rohit):
    client = TestClient(app)
    new_client_name = "Zenith Global Audits"
    response = client.post(
        "/api/clients",
        json={"name": new_client_name},
        headers=auth_headers_rohit
    )
    assert response.status_code == 201
    created = response.json()
    assert created["name"] == new_client_name
    assert "id" in created

    get_resp = client.get(f"/api/clients/{created['id']}", headers=auth_headers_rohit)
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == new_client_name
