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


def test_full_document_workflow():
    """
    Test the complete 5-step CA audit document review lifecycle:
    Upload (Staff) -> Start Review (Reviewer) -> Request Correction (Reviewer) ->
    Re-upload (Staff) -> Approve (Reviewer).
    """
    client = TestClient(app)
    token_staff = get_token("rohit@abc.com")
    token_reviewer = get_token("aman@abc.com")
    headers_staff = {"Authorization": f"Bearer {token_staff}"}
    headers_reviewer = {"Authorization": f"Bearer {token_reviewer}"}

    # 1. Get ABC Traders client and its pre-seeded "Bank Statement" document
    clients_resp = client.get("/api/clients", headers=headers_staff)
    abc_client = next(c for c in clients_resp.json() if c["name"] == "ABC Traders Pvt. Ltd.")
    client_id = abc_client["id"]

    docs_resp = client.get(f"/api/clients/{client_id}/documents", headers=headers_staff)
    bank_doc = next(d for d in docs_resp.json() if d["name"] == "Bank Statement")
    doc_id = bank_doc["id"]
    assert bank_doc["status"] == "PENDING"
    assert bank_doc["version"] == 1

    # 2. Staff uploads initial document
    file_content = b"%PDF-1.4 Mock Bank Statement for FY24"
    upload_resp = client.post(
        f"/api/documents/{doc_id}/upload",
        files={"file": ("Bank_Statement_v1.pdf", io.BytesIO(file_content), "application/pdf")},
        headers=headers_staff
    )
    assert upload_resp.status_code == 200
    doc_data = upload_resp.json()
    assert doc_data["status"] == "UPLOADED"
    assert doc_data["version"] == 1
    assert doc_data["uploaded_by"] is not None

    # 3. Security check: Staff CANNOT approve document (403 Forbidden)
    staff_approve_resp = client.post(
        f"/api/documents/{doc_id}/approve",
        headers=headers_staff
    )
    assert staff_approve_resp.status_code == 403

    # 4. Security check: Staff CANNOT request correction (403 Forbidden)
    staff_corr_resp = client.post(
        f"/api/documents/{doc_id}/request-correction",
        json={"comment": "Malicious correction by staff"},
        headers=headers_staff
    )
    assert staff_corr_resp.status_code == 403

    # 5. Reviewer starts review: UPLOADED -> UNDER_REVIEW
    review_resp = client.post(
        f"/api/documents/{doc_id}/start-review",
        headers=headers_reviewer
    )
    assert review_resp.status_code == 200
    assert review_resp.json()["status"] == "UNDER_REVIEW"

    # 6. Reviewer requests correction without comment -> 422 Unprocessable Entity
    empty_corr_resp = client.post(
        f"/api/documents/{doc_id}/request-correction",
        json={"comment": "   "},
        headers=headers_reviewer
    )
    assert empty_corr_resp.status_code == 422

    # 7. Reviewer requests correction with valid comment -> CORRECTION_REQUIRED
    valid_corr_resp = client.post(
        f"/api/documents/{doc_id}/request-correction",
        json={"comment": "Page 3 is missing. Please upload the complete bank statement."},
        headers=headers_reviewer
    )
    assert valid_corr_resp.status_code == 200
    assert valid_corr_resp.json()["status"] == "CORRECTION_REQUIRED"
    assert valid_corr_resp.json()["review_comment"] == "Page 3 is missing. Please upload the complete bank statement."

    # 8. Staff re-uploads revised document -> version becomes 2, status becomes UPLOADED
    v2_content = b"%PDF-1.4 Complete Bank Statement with Page 3 Included"
    reupload_resp = client.post(
        f"/api/documents/{doc_id}/reupload",
        files={"file": ("Bank_Statement_v2.pdf", io.BytesIO(v2_content), "application/pdf")},
        headers=headers_staff
    )
    assert reupload_resp.status_code == 200
    doc_v2 = reupload_resp.json()
    assert doc_v2["status"] == "UPLOADED"
    assert doc_v2["version"] == 2

    # 9. Reviewer puts v2 into review: UPLOADED -> UNDER_REVIEW
    review2_resp = client.post(
        f"/api/documents/{doc_id}/start-review",
        headers=headers_reviewer
    )
    assert review2_resp.status_code == 200
    assert review2_resp.json()["status"] == "UNDER_REVIEW"

    # 10. Reviewer approves v2: UNDER_REVIEW -> APPROVED
    approve_resp = client.post(
        f"/api/documents/{doc_id}/approve",
        json={"comment": "All pages verified. Approved."},
        headers=headers_reviewer
    )
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == "APPROVED"

    # 11. Test file streaming: Fetch private file
    file_stream_resp = client.get(
        f"/api/documents/{doc_id}/file",
        headers=headers_staff
    )
    assert file_stream_resp.status_code == 200
    assert file_stream_resp.content == v2_content


def test_cross_tenant_document_isolation():
    """
    CRITICAL SECURITY CHECK:
    Firm B reviewer (Priya) cannot read or modify Firm A's document.
    Returns 404 Not Found.
    """
    client = TestClient(app)
    token_staff_a = get_token("rohit@abc.com")
    token_reviewer_b = get_token("priya@xyz.com")

    # Get doc_id from Firm A
    clients_resp = client.get("/api/clients", headers={"Authorization": f"Bearer {token_staff_a}"})
    abc_client = next(c for c in clients_resp.json() if c["name"] == "ABC Traders Pvt. Ltd.")
    docs_resp = client.get(f"/api/clients/{abc_client['id']}/documents", headers={"Authorization": f"Bearer {token_staff_a}"})
    doc_a_id = docs_resp.json()[0]["id"]

    # Priya (Firm B) attempts to read Firm A document
    idor_read = client.get(f"/api/documents/{doc_a_id}", headers={"Authorization": f"Bearer {token_reviewer_b}"})
    assert idor_read.status_code == 404

    # Priya (Firm B) attempts to approve Firm A document
    idor_approve = client.post(f"/api/documents/{doc_a_id}/approve", headers={"Authorization": f"Bearer {token_reviewer_b}"})
    assert idor_approve.status_code == 404

    # Priya attempts to download Firm A file
    idor_stream = client.get(f"/api/documents/{doc_a_id}/file", headers={"Authorization": f"Bearer {token_reviewer_b}"})
    assert idor_stream.status_code == 404
