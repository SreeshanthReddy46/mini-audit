from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.audit_event import AuditEvent


class AuditRepository:
    """
    Repository for immutable, append-only AuditEvent records.
    Strictly prohibits UPDATE and DELETE operations.
    Enforces firm-level isolation on all reads.
    """

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        firm_id: UUID,
        action: str,
        actor_id: Optional[UUID] = None,
        document_id: Optional[UUID] = None,
        entity_type: str = "document",
        entity_id: Optional[UUID] = None,
        comment: Optional[str] = None,
        metadata_json: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditEvent:
        """
        Appends an immutable audit event to the log.
        Must be invoked in the same transaction as state-modifying business actions.
        """
        event = AuditEvent(
            firm_id=firm_id,
            action=action,
            actor_id=actor_id,
            document_id=document_id,
            entity_type=entity_type,
            entity_id=entity_id or document_id,
            comment=comment,
            metadata_json=metadata_json or {},
            ip_address=ip_address,
            user_agent=user_agent,
        )
        self.db.add(event)
        self.db.flush()
        return event

    def list_by_firm(self, firm_id: UUID, limit: int = 100) -> List[AuditEvent]:
        """Lists audit events for a firm in reverse chronological order."""
        return (
            self.db.query(AuditEvent)
            .filter(AuditEvent.firm_id == firm_id)
            .order_by(AuditEvent.created_at.desc())
            .limit(limit)
            .all()
        )

    def list_by_document(self, document_id: UUID, firm_id: UUID) -> List[AuditEvent]:
        """Lists audit events for a specific document, bounded to firm."""
        return (
            self.db.query(AuditEvent)
            .filter(AuditEvent.document_id == document_id, AuditEvent.firm_id == firm_id)
            .order_by(AuditEvent.created_at.desc())
            .all()
        )
