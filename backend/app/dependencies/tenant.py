from uuid import UUID
from fastapi import Depends, HTTPException, status
from app.dependencies.auth import get_current_user
from app.models.user import User


def get_current_firm_id(current_user: User = Depends(get_current_user)) -> UUID:
    """Returns the firm_id of the currently authenticated user."""
    return current_user.firm_id


def verify_same_firm(resource_firm_id: UUID, user_firm_id: UUID, resource_name: str = "Resource"):
    """
    Verifies that a target resource belongs to the requesting user's firm.
    Raises HTTP 404 (Not Found) rather than 403 (Forbidden) to completely prevent
    cross-tenant resource enumeration and IDOR discovery.
    """
    if resource_firm_id != user_firm_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource_name} not found",
        )


require_same_firm = verify_same_firm

