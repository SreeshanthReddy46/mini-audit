import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.seed import seed_database

client = TestClient(app)


@pytest.fixture(autouse=True, scope="module")
def setup_test_db():
    seed_database()


def get_token(email: str, password: str = "password123") -> str:
    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    return resp.json()["access_token"]


def test_review_history_and_isolation():
    staff_token = get_token("rohit@abc.com")
    reviewer_token = get_token("aman@abc.com")
    b_reviewer_token = get_token("priya@xyz.com")

    headers_staff = {"Authorization": f"Bearer {staff_token}"}
    headers_reviewer = {"Authorization": f"Bearer {reviewer_token}"}
    headers_b = {"Authorization": f"Bearer {b_reviewer_token}"}

    clients_resp = client.get("/api/clients", headers=headers_staff)
    client_a = next(c for c in clients_resp.json() if c["name"] == "ABC Traders Pvt. Ltd.")

    docs_resp = client.get(f"/api/clients/{client_a['id']}/documents", headers=headers_staff)
    bank_doc = next(d for d in docs_resp.json() if d["name"] == "Bank Statement")
    doc_id = bank_doc["id"]

    upload_resp = client.post(
        f"/api/documents/{doc_id}/upload",
        files={"file": ("Bank_Statement_Mar2026.pdf", io.BytesIO(b"%PDF-1.4 Bank sample content"), "application/pdf")},
        headers=headers_staff,
    )
    assert upload_resp.status_code == 200

    start_resp = client.post(f"/api/documents/{doc_id}/start-review", headers=headers_reviewer)
    assert start_resp.status_code == 200

    correction_resp = client.post(
        f"/api/documents/{doc_id}/request-correction",
        json={"comment": "March closing balance summary page missing."},
        headers=headers_reviewer,
    )
    assert correction_resp.status_code == 200

    reviews_resp = client.get(f"/api/documents/{doc_id}/reviews", headers=headers_reviewer)
    assert reviews_resp.status_code == 200
    reviews = reviews_resp.json()
    assert len(reviews) >= 1
    latest = reviews[0]
    assert latest["decision"] == "CORRECTION_REQUIRED"
    assert "March closing balance" in latest["comment"]
    assert latest["reviewer_name"] == "Aman"

    cross_resp = client.get(f"/api/documents/{doc_id}/reviews", headers=headers_b)
    assert cross_resp.status_code == 404
