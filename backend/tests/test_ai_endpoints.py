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


def test_ai_analysis_endpoints_and_read_only_invariants():
    staff_token = get_token("rohit@abc.com")
    reviewer_token = get_token("aman@abc.com")
    b_reviewer_token = get_token("priya@xyz.com")

    headers_staff = {"Authorization": f"Bearer {staff_token}"}
    headers_reviewer = {"Authorization": f"Bearer {reviewer_token}"}
    headers_b = {"Authorization": f"Bearer {b_reviewer_token}"}

    # 1. Get ABC Traders Bank Statement
    clients_resp = client.get("/api/clients", headers=headers_staff)
    client_a = next(c for c in clients_resp.json() if c["name"] == "ABC Traders Pvt. Ltd.")
    docs_resp = client.get(f"/api/clients/{client_a['id']}/documents", headers=headers_staff)
    bank_doc = next(d for d in docs_resp.json() if d["name"] == "Bank Statement")
    doc_id = bank_doc["id"]

    # 2. Upload a sample file
    upload_resp = client.post(
        f"/api/documents/{doc_id}/upload",
        files={"file": ("Bank_March_2026.pdf", io.BytesIO(b"HDFC Bank Transactions March 2026"), "application/pdf")},
        headers=headers_staff,
    )
    assert upload_resp.status_code == 200
    initial_status = upload_resp.json()["status"]

    # 3. Trigger advisory AI analysis
    analyze_resp = client.post(
        f"/api/documents/{doc_id}/analyze",
        headers=headers_reviewer,
    )
    assert analyze_resp.status_code == 200
    data = analyze_resp.json()
    assert data["document_id"] == doc_id
    assert data["status"] == "COMPLETED"
    assert data["model"] == "mini-audit-advisory-v1"
    assert len(data["findings"]) >= 1

    # CRITICAL PRINCIPLE: Verify document status did NOT change to APPROVED
    doc_after = client.get(f"/api/documents/{doc_id}", headers=headers_reviewer).json()
    assert doc_after["status"] == initial_status
    assert doc_after["status"] != "APPROVED"

    # 4. Fetch latest analysis via GET
    get_analysis_resp = client.get(
        f"/api/documents/{doc_id}/analysis",
        headers=headers_reviewer,
    )
    assert get_analysis_resp.status_code == 200
    assert get_analysis_resp.json()["id"] == data["id"]

    # 5. Multi-tenant boundary check: Firm B reviewer cannot trigger analysis on Firm A document (404)
    cross_resp = client.post(f"/api/documents/{doc_id}/analyze", headers=headers_b)
    assert cross_resp.status_code == 404

    cross_get = client.get(f"/api/documents/{doc_id}/analysis", headers=headers_b)
    assert cross_get.status_code == 404
