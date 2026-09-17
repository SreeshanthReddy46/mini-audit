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


def test_document_versions_lifecycle_and_fingerprints():
    staff_token = get_token("rohit@abc.com")
    reviewer_token = get_token("aman@abc.com")
    b_token = get_token("priya@xyz.com")

    headers_staff = {"Authorization": f"Bearer {staff_token}"}
    headers_reviewer = {"Authorization": f"Bearer {reviewer_token}"}
    headers_b = {"Authorization": f"Bearer {b_token}"}

    clients_resp = client.get("/api/clients", headers=headers_staff)
    client_a = next(c for c in clients_resp.json() if c["name"] == "ABC Traders Pvt. Ltd.")
    docs_resp = client.get(f"/api/clients/{client_a['id']}/documents", headers=headers_staff)
    purchase_doc = next(d for d in docs_resp.json() if d["name"] == "Purchase Register")
    doc_id = purchase_doc["id"]

    upload_1 = client.post(
        f"/api/documents/{doc_id}/upload",
        files={"file": ("Purchases_v1.pdf", io.BytesIO(b"Purchase Register 2026 Raw"), "application/pdf")},
        headers=headers_staff,
    )
    assert upload_1.status_code == 200

    client.post(f"/api/documents/{doc_id}/start-review", headers=headers_reviewer)
    client.post(
        f"/api/documents/{doc_id}/request-correction",
        json={"comment": "Missing ITC schedule on page 3."},
        headers=headers_reviewer,
    )

    upload_2 = client.post(
        f"/api/documents/{doc_id}/reupload",
        files={"file": ("Purchases_v2_corrected.pdf", io.BytesIO(b"Purchase Register 2026 with ITC"), "application/pdf")},
        headers=headers_staff,
    )
    assert upload_2.status_code == 200

    versions_resp = client.get(f"/api/documents/{doc_id}/versions", headers=headers_reviewer)
    assert versions_resp.status_code == 200
    versions = versions_resp.json()
    assert len(versions) == 2
    assert versions[0]["version_number"] == 2
    assert versions[0]["original_name"] == "Purchases_v2_corrected.pdf"
    assert len(versions[0]["sha256_hash"]) == 64
    assert versions[1]["version_number"] == 1
    assert versions[1]["original_name"] == "Purchases_v1.pdf"
    assert len(versions[1]["sha256_hash"]) == 64

    cross_resp = client.get(f"/api/documents/{doc_id}/versions", headers=headers_b)
    assert cross_resp.status_code == 404
