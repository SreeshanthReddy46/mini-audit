from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.exceptions import TenantIsolationError, InvalidWorkflowStateError
from app.core.constants import DocumentStatus, ReviewDecision, AuditAction, AuditEntity
from app.models.document import Document
from app.models.review import Review
from app.models.audit_event import AuditEvent
from app.repositories.document_repository import DocumentRepository
from app.repositories.review_repository import ReviewRepository
from app.repositories.audit_repository import AuditRepository


class ReviewService:
    """
    Encapsulates review workflow transitions and audit trail logging.
    Strictly enforces the deterministic state machine:
    - start_review: UPLOADED -> UNDER_REVIEW
    - request_correction: UNDER_REVIEW -> CORRECTION_REQUIRED (mandatory comment)
    - approve_document: UNDER_REVIEW -> APPROVED
    All mutations write to both reviews and append-only audit_events in one transaction.
    """

    def __init__(self, db: Session):
        self.db = db
        self.doc_repo = DocumentRepository(db)
        self.review_repo = ReviewRepository(db)
        self.audit_repo = AuditRepository(db)

    def start_review(
        self,
        document_id: UUID,
        firm_id: UUID,
        reviewer_id: UUID,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Document:
        doc = self.doc_repo.get_by_id(document_id, firm_id)
        if not doc:
            raise TenantIsolationError("Document not found")

        if doc.status not in [DocumentStatus.UPLOADED.value, DocumentStatus.CORRECTION_REQUIRED.value]:
            raise InvalidWorkflowStateError(
                f"Cannot start review: Document status is '{doc.status}', expected 'UPLOADED'."
            )

        doc.status = DocumentStatus.UNDER_REVIEW.value
        doc.reviewed_by = reviewer_id
        doc.updated_at = datetime.now(timezone.utc)

        self.audit_repo.create(
            firm_id=firm_id,
            action=AuditAction.REVIEW_STARTED.value,
            actor_id=reviewer_id,
            document_id=doc.id,
            entity_type=AuditEntity.DOCUMENT.value,
            entity_id=doc.id,
            comment="Review commenced by reviewer",
            metadata_json={"document_name": doc.name, "version": doc.version},
            ip_address=ip_address,
            user_agent=user_agent,
        )

        self.db.commit()
        self.db.refresh(doc)
        return doc

    def request_correction(
        self,
        document_id: UUID,
        firm_id: UUID,
        reviewer_id: UUID,
        comment: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Document:
        if not comment or not comment.strip():
            raise InvalidWorkflowStateError("A reason must be provided when requesting a correction.")

        doc = self.doc_repo.get_by_id(document_id, firm_id)
        if not doc:
            raise TenantIsolationError("Document not found")

        if doc.status != DocumentStatus.UNDER_REVIEW.value:
            raise InvalidWorkflowStateError(
                f"Cannot request correction: Document status is '{doc.status}', expected 'UNDER_REVIEW'."
            )

        doc.status = DocumentStatus.CORRECTION_REQUIRED.value
        doc.review_comment = comment.strip()
        doc.reviewed_by = reviewer_id
        doc.updated_at = datetime.now(timezone.utc)

        self.review_repo.create(
            firm_id=firm_id,
            document_id=doc.id,
            reviewer_id=reviewer_id,
            decision=ReviewDecision.CORRECTION_REQUIRED.value,
            comment=comment.strip(),
        )

        self.audit_repo.create(
            firm_id=firm_id,
            action=AuditAction.CORRECTION_REQUESTED.value,
            actor_id=reviewer_id,
            document_id=doc.id,
            entity_type=AuditEntity.REVIEW.value,
            entity_id=doc.id,
            comment=comment.strip(),
            metadata_json={
                "document_name": doc.name,
                "version": doc.version,
                "decision": ReviewDecision.CORRECTION_REQUIRED.value,
            },
            ip_address=ip_address,
            user_agent=user_agent,
        )

        self.db.commit()
        self.db.refresh(doc)
        return doc

    def approve_document(
        self,
        document_id: UUID,
        firm_id: UUID,
        reviewer_id: UUID,
        comment: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Document:
        doc = self.doc_repo.get_by_id(document_id, firm_id)
        if not doc:
            raise TenantIsolationError("Document not found")

        if doc.status != DocumentStatus.UNDER_REVIEW.value:
            raise InvalidWorkflowStateError(
                f"Cannot approve document: Status is '{doc.status}', must be 'UNDER_REVIEW'."
            )

        doc.status = DocumentStatus.APPROVED.value
        doc.review_comment = comment.strip() if comment else None
        doc.reviewed_by = reviewer_id
        doc.updated_at = datetime.now(timezone.utc)

        self.review_repo.create(
            firm_id=firm_id,
            document_id=doc.id,
            reviewer_id=reviewer_id,
            decision=ReviewDecision.APPROVED.value,
            comment=comment.strip() if comment else "Approved without additional comments.",
        )

        self.audit_repo.create(
            firm_id=firm_id,
            action=AuditAction.DOCUMENT_APPROVED.value,
            actor_id=reviewer_id,
            document_id=doc.id,
            entity_type=AuditEntity.REVIEW.value,
            entity_id=doc.id,
            comment=comment.strip() if comment else "Document approved",
            metadata_json={
                "document_name": doc.name,
                "version": doc.version,
                "decision": ReviewDecision.APPROVED.value,
            },
            ip_address=ip_address,
            user_agent=user_agent,
        )

        self.db.commit()
        self.db.refresh(doc)
        return doc

    def list_reviews_by_document(self, document_id: UUID, firm_id: UUID) -> List[Review]:
        doc = self.doc_repo.get_by_id(document_id, firm_id)
        if not doc:
            raise TenantIsolationError("Document not found")
        return self.review_repo.list_by_document(document_id, firm_id)
