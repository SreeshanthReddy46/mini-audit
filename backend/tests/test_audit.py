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


def test_audit_trail_lifecycle_and_immutability():
    """
    Verify complete audit event creation and immutability invariants.
    """
    client = TestClient(app)
    token_staff = get_token("rohit@abc.com")
    token_reviewer = get_token("aman@abc.com")
    headers_staff = {"Authorization": f"Bearer {token_staff}"}
    headers_reviewer = {"Authorization": f"Bearer {token_reviewer}"}

    # Find GST Return document in Firm A
    clients_resp = client.get("/api/clients", headers=headers_staff)
    abc_client = next(c for c in clients_resp.json() if c["name"] == "ABC Traders Pvt. Ltd.")
    docs_resp = client.get(f"/api/clients/{abc_client['id']}/documents", headers=headers_staff)
    gst_doc = next(d for d in docs_resp.json() if d["name"] == "GST Return")
    doc_id = gst_doc["id"]

    # 1. Staff uploads document
    client.post(
        f"/api/documents/{doc_id}/upload",
        files={"file": ("GST_GSTR3B_Q1.pdf", io.BytesIO(b"%PDF-1.4 Mock GST Data"), "application/pdf")},
        headers=headers_staff
    )

    # 2. Reviewer starts review
    client.post(f"/api/documents/{doc_id}/start-review", headers=headers_reviewer)

    # 3. Reviewer requests correction
    client.post(
        f"/api/documents/{doc_id}/request-correction",
        json={"comment": "Turnover mismatch with ledger. Please clarify."},
        headers=headers_reviewer
    )

    # 4. Staff re-uploads
    client.post(
        f"/api/documents/{doc_id}/reupload",
        files={"file": ("GST_GSTR3B_Q1_revised.pdf", io.BytesIO(b"%PDF-1.4 Revised GST"), "application/pdf")},
        headers=headers_staff
    )

    # 5. Reviewer reviews again and approves
    client.post(f"/api/documents/{doc_id}/start-review", headers=headers_reviewer)
    client.post(
        f"/api/documents/{doc_id}/approve",
        json={"comment": "Turnover reconciled and approved."},
        headers=headers_reviewer
    )

    # 6. Fetch document audit history
    audit_resp = client.get(f"/api/documents/{doc_id}/audit", headers=headers_reviewer)
    assert audit_resp.status_code == 200
    events = audit_resp.json()
    actions = [ev["action"] for ev in events]

    assert "DOCUMENT_ADDED" in actions
    assert "DOCUMENT_UPLOADED" in actions
    assert "REVIEW_STARTED" in actions
    assert "CORRECTION_REQUESTED" in actions
    assert "DOCUMENT_REUPLOADED" in actions
    assert "DOCUMENT_APPROVED" in actions

    # Verify that actors and roles are properly recorded
    upload_event = next(ev for ev in events if ev["action"] == "DOCUMENT_UPLOADED")
    assert upload_event["actor_name"] == "Rohit"
    assert upload_event["actor_role"] == "STAFF"

    correction_event = next(ev for ev in events if ev["action"] == "CORRECTION_REQUESTED")
    assert correction_event["actor_name"] == "Aman"
    assert correction_event["actor_role"] == "REVIEWER"
    assert correction_event["comment"] == "Turnover mismatch with ledger. Please clarify."


def test_audit_trail_immutable_no_update_or_delete_endpoints():
    """
    CRITICAL SECURITY INVARIANT:
    Audit logs cannot be edited or deleted through any HTTP endpoint.
    """
    client = TestClient(app)
    token_reviewer = get_token("aman@abc.com")
    headers = {"Authorization": f"Bearer {token_reviewer}"}

    # Attempt PUT on audit
    put_resp = client.put("/api/audit", json={"action": "TAMPERED"}, headers=headers)
    assert put_resp.status_code == 405  # Method Not Allowed

    # Attempt DELETE on audit
    del_resp = client.delete("/api/audit", headers=headers)
    assert del_resp.status_code == 405


def test_cross_tenant_audit_isolation():
    """
    Firm B user cannot view Firm A's document audit trail.
    """
    client = TestClient(app)
    token_staff_a = get_token("rohit@abc.com")
    token_reviewer_b = get_token("priya@xyz.com")

    # Discover doc_id in Firm A
    clients_resp = client.get("/api/clients", headers={"Authorization": f"Bearer {token_staff_a}"})
    abc_client = next(c for c in clients_resp.json() if c["name"] == "ABC Traders Pvt. Ltd.")
    docs_resp = client.get(f"/api/clients/{abc_client['id']}/documents", headers={"Authorization": f"Bearer {token_staff_a}"})
    doc_a_id = docs_resp.json()[0]["id"]

    # Priya (Firm B) tries to read Firm A document audit history
    resp = client.get(f"/api/documents/{doc_a_id}/audit", headers={"Authorization": f"Bearer {token_reviewer_b}"})
    assert resp.status_code == 404
