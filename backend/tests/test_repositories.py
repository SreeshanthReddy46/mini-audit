import uuid
import pytest
from app.core.database import SessionLocal, Base, engine
from app.models import Firm, User, Client, Document, DocumentVersion, Review, AuditEvent, AIAnalysis
from app.repositories import ClientRepository, DocumentRepository, ReviewRepository, AuditRepository


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield


def test_client_repository_tenant_isolation():
    db = SessionLocal()
    try:
        firm_a_id = uuid.uuid4()
        firm_b_id = uuid.uuid4()

        repo = ClientRepository(db)
        client_a = repo.create(firm_id=firm_a_id, name="Tenant A Client", email="a@client.com")
        db.commit()

        # Firm A can find its client
        found = repo.get_by_id(client_a.id, firm_a_id)
        assert found is not None
        assert found.name == "Tenant A Client"

        # Firm B CANNOT find Firm A's client (returns None)
        forbidden = repo.get_by_id(client_a.id, firm_b_id)
        assert forbidden is None

        # Listing only returns the firm's clients
        firm_a_clients = repo.list_by_firm(firm_a_id)
        assert len(firm_a_clients) == 1
        firm_b_clients = repo.list_by_firm(firm_b_id)
        assert len(firm_b_clients) == 0
    finally:
        db.close()


def test_document_versioning_and_reviews():
    db = SessionLocal()
    try:
        firm_id = uuid.uuid4()
        client_id = uuid.uuid4()

        doc_repo = DocumentRepository(db)
        review_repo = ReviewRepository(db)

        # 1. Create document
        doc = doc_repo.create(
            firm_id=firm_id,
            client_id=client_id,
            name="Bank Statement March 2026",
            document_type="bank_statement"
        )
        db.commit()

        # 2. Add version 1
        v1 = doc_repo.create_version(
            document_id=doc.id,
            firm_id=firm_id,
            version_number=1,
            storage_key="firms/1/v1.pdf",
            original_name="bank_statement_v1.pdf",
            mime_type="application/pdf",
            file_size=10240,
            sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        )
        db.commit()

        # 3. Add version 2
        v2 = doc_repo.create_version(
            document_id=doc.id,
            firm_id=firm_id,
            version_number=2,
            storage_key="firms/1/v2.pdf",
            original_name="bank_statement_v2_corrected.pdf",
            mime_type="application/pdf",
            file_size=12500,
            sha256_hash="a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
        )
        db.commit()

        # Fetch versions
        versions = doc_repo.get_versions(doc.id, firm_id)
        assert len(versions) == 2
        assert versions[0].version_number == 2  # Newest first
        assert versions[1].version_number == 1

        # 4. Review decision
        review = review_repo.create(
            firm_id=firm_id,
            document_id=doc.id,
            reviewer_id=None,
            decision="APPROVED",
            comment="All transactions reconciled cleanly."
        )
        db.commit()

        reviews = review_repo.list_by_document(doc.id, firm_id)
        assert len(reviews) == 1
        assert reviews[0].decision == "APPROVED"
        assert reviews[0].comment == "All transactions reconciled cleanly."
    finally:
        db.close()


def test_audit_repository_append_only():
    db = SessionLocal()
    try:
        firm_id = uuid.uuid4()
        audit_repo = AuditRepository(db)

        # Log event
        event = audit_repo.create(
            firm_id=firm_id,
            action="DOCUMENT_APPROVED",
            entity_type="document",
            comment="Approved by reviewer Aman",
            metadata_json={"compliance_check": "passed"},
            ip_address="127.0.0.1",
            user_agent="PytestRunner/1.0"
        )
        db.commit()

        events = audit_repo.list_by_firm(firm_id)
        assert len(events) >= 1
        latest = events[0]
        assert latest.action == "DOCUMENT_APPROVED"
        assert latest.ip_address == "127.0.0.1"
        assert latest.metadata_json["compliance_check"] == "passed"
    finally:
        db.close()
