from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.audit import AuditEventResponse
from app.services.audit_service import get_firm_audit_history

router = APIRouter(prefix="/api/audit", tags=["Audit Trail"])


@router.get("", response_model=List[AuditEventResponse])
def get_firm_audit_log(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve recent firm-wide audit trail.
    Enforces firm_id boundary. Append-only (no PUT, PATCH, or DELETE endpoints exist).
    """
    return get_firm_audit_history(db, current_user.firm_id)
