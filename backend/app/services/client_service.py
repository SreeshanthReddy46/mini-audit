import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.client import Client
from app.models.document import Document
from app.models.audit_event import AuditEvent


def get_clients_for_firm(db: Session, firm_id: uuid.UUID) -> List[dict]:
    """Retrieve all clients strictly belonging to the given firm, with document counts."""
    clients = db.query(Client).filter(Client.firm_id == firm_id).order_by(Client.created_at.desc()).all()
    
    results = []
    for client in clients:
        doc_count = db.query(func.count(Document.id)).filter(
            Document.client_id == client.id,
            Document.firm_id == firm_id
        ).scalar() or 0
        
        results.append({
            "id": client.id,
            "firm_id": client.firm_id,
            "name": client.name,
            "created_at": client.created_at,
            "document_count": doc_count
        })
    return results


def get_client_by_id(db: Session, client_id: uuid.UUID, firm_id: uuid.UUID) -> Optional[dict]:
    """Retrieve a single client strictly scoped by firm_id (Tenant Isolation)."""
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.firm_id == firm_id
    ).first()
    
    if not client:
        return None

    doc_count = db.query(func.count(Document.id)).filter(
        Document.client_id == client.id,
        Document.firm_id == firm_id
    ).scalar() or 0

    return {
        "id": client.id,
        "firm_id": client.firm_id,
        "name": client.name,
        "created_at": client.created_at,
        "document_count": doc_count
    }


def create_client_for_firm(db: Session, firm_id: uuid.UUID, actor_id: uuid.UUID, name: str) -> dict:
    """Create a client and log the CLIENT_CREATED audit event in the same atomic transaction."""
    client = Client(
        firm_id=firm_id,
        name=name.strip()
    )
    db.add(client)
    db.flush()

    audit_event = AuditEvent(
        firm_id=firm_id,
        actor_id=actor_id,
        action="CLIENT_CREATED",
        comment=f"Created client '{client.name}'",
        metadata_json={"client_name": client.name, "client_id": str(client.id)}
    )
    db.add(audit_event)
    db.commit()
    db.refresh(client)

    return {
        "id": client.id,
        "firm_id": client.firm_id,
        "name": client.name,
        "created_at": client.created_at,
        "document_count": 0
    }
