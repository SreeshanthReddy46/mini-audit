from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.client import Client


class ClientRepository:
    """
    Repository for Client data access.
    Enforces tenant isolation by requiring firm_id on all queries.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, client_id: UUID, firm_id: UUID) -> Optional[Client]:
        """Fetches a client by ID only if it belongs to the specified firm."""
        return (
            self.db.query(Client)
            .filter(Client.id == client_id, Client.firm_id == firm_id)
            .first()
        )

    def list_by_firm(self, firm_id: UUID) -> List[Client]:
        """Lists all clients belonging strictly to the specified firm."""
        return (
            self.db.query(Client)
            .filter(Client.firm_id == firm_id)
            .order_by(Client.name.asc())
            .all()
        )

    def create(
        self,
        firm_id: UUID,
        name: str,
        email: Optional[str] = None,
        phone: Optional[str] = None,
    ) -> Client:
        """Creates a new client bound to a firm."""
        client = Client(
            firm_id=firm_id,
            name=name,
            email=email,
            phone=phone,
            status="ACTIVE",
        )
        self.db.add(client)
        self.db.flush()
        return client
