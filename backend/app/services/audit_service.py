import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.audit_event import AuditEvent
from app.models.user import User


def log_audit_event(
    db: Session,
    firm_id: uuid.UUID,
    actor_id: Optional[uuid.UUID],
    action: str,
    document_id: Optional[uuid.UUID] = None,
    client_id: Optional[uuid.UUID] = None,
    comment: Optional[str] = None,
    metadata_json: Optional[Dict[str, Any]] = None
) -> AuditEvent:
    """
    Append-only audit logging helper.
    Matches exact audit_events table schema:
    (id, firm_id, document_id, actor_id, action, comment, created_at, metadata_json).
    """
    meta = dict(metadata_json) if metadata_json else {}
    if client_id:
        meta["client_id"] = str(client_id)

    event = AuditEvent(
        firm_id=firm_id,
        actor_id=actor_id,
        document_id=document_id,
        action=action,
        comment=comment,
        metadata_json=meta,
        created_at=datetime.now(timezone.utc)
    )
    db.add(event)
    return event


def get_audit_history_for_document(
    db: Session,
    document_id: uuid.UUID,
    firm_id: uuid.UUID
) -> List[dict]:
    """Retrieve chronological audit events for a document, enforcing firm boundary."""
    events = (
        db.query(AuditEvent)
        .filter(
            AuditEvent.document_id == document_id,
            AuditEvent.firm_id == firm_id
        )
        .order_by(AuditEvent.created_at.asc())
        .all()
    )

    results = []
    for ev in events:
        actor_name = None
        actor_role = None
        if ev.actor:
            actor_name = ev.actor.name
            actor_role = ev.actor.role
        elif ev.actor_id:
            user = db.query(User).filter(User.id == ev.actor_id).first()
            if user:
                actor_name = user.name
                actor_role = user.role

        results.append({
            "id": ev.id,
            "firm_id": ev.firm_id,
            "document_id": ev.document_id,
            "actor_id": ev.actor_id,
            "actor_name": actor_name,
            "actor_role": actor_role,
            "action": ev.action,
            "comment": ev.comment,
            "metadata_json": ev.metadata_json or {},
            "created_at": ev.created_at
        })
    return results


def get_firm_audit_history(
    db: Session,
    firm_id: uuid.UUID
) -> List[dict]:
    """Retrieve all recent firm audit events, enforcing firm boundary."""
    events = (
        db.query(AuditEvent)
        .filter(AuditEvent.firm_id == firm_id)
        .order_by(AuditEvent.created_at.desc())
        .limit(100)
        .all()
    )

    results = []
    for ev in events:
        actor_name = ev.actor.name if ev.actor else None
        actor_role = ev.actor.role if ev.actor else None
        results.append({
            "id": ev.id,
            "firm_id": ev.firm_id,
            "document_id": ev.document_id,
            "actor_id": ev.actor_id,
            "actor_name": actor_name,
            "actor_role": actor_role,
            "action": ev.action,
            "comment": ev.comment,
            "metadata_json": ev.metadata_json or {},
            "created_at": ev.created_at
        })
    return results
