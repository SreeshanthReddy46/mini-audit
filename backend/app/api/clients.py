import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.client import ClientCreate, ClientResponse
from app.services.client_service import get_clients_for_firm, get_client_by_id, create_client_for_firm

router = APIRouter(prefix="/api/clients", tags=["Clients"])


@router.get("", response_model=List[ClientResponse])
def list_clients(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all clients strictly belonging to the authenticated user's firm."""
    return get_clients_for_firm(db, current_user.firm_id)


@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    client_in: ClientCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new client scoped to current user's firm, logging CLIENT_CREATED event."""
    if not client_in.name.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Client name cannot be empty."
        )
    return create_client_for_firm(
        db=db,
        firm_id=current_user.firm_id,
        actor_id=current_user.id,
        name=client_in.name
    )


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a single client by ID.
    CRITICAL SECURITY CHECK: Enforces client.firm_id == current_user.firm_id.
    Returns 404 Not Found if resource belongs to another tenant.
    """
    client = get_client_by_id(db, client_id, current_user.firm_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    return client
