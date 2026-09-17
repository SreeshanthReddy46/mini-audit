import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.seed import seed_database


@pytest.fixture(autouse=True, scope="module")
def setup_test_db():
    seed_database()


@pytest.fixture
def client():
    return TestClient(app)


def test_login_success_staff(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "rohit@abc.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "rohit@abc.com"
    assert data["user"]["role"] == "STAFF"
    assert data["user"]["firm_name"] == "ABC & Co."
    assert "access_token" in response.cookies


def test_login_success_reviewer(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "aman@abc.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "REVIEWER"


def test_login_invalid_password(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "rohit@abc.com", "password": "wrong-password"}
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_login_nonexistent_user(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@abc.com", "password": "password123"}
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_me_with_bearer_token(client):
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "rohit@abc.com", "password": "password123"}
    )
    token = login_resp.json()["access_token"]

    # Use fresh client to test pure header
    auth_client = TestClient(app)
    response = auth_client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "rohit@abc.com"
    assert data["name"] == "Rohit"


def test_me_with_session_cookie(client):
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "aman@abc.com", "password": "password123"}
    )
    assert login_resp.status_code == 200

    # Cookie automatically persisted in this client
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "aman@abc.com"
    assert data["role"] == "REVIEWER"


def test_me_unauthenticated():
    # Fresh unauthenticated client
    fresh_client = TestClient(app)
    response = fresh_client.get("/api/auth/me")
    assert response.status_code == 401


def test_logout(client):
    client.post(
        "/api/auth/login",
        json={"email": "rohit@abc.com", "password": "password123"}
    )
    logout_resp = client.post("/api/auth/logout")
    assert logout_resp.status_code == 200
    assert logout_resp.json()["message"] == "Logged out successfully"
