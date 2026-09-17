import uuid
from typing import List
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.permissions import require_reviewer
from app.models.user import User
from app.schemas.review import ReviewResponse, ReviewCreate
from app.schemas.document import DocumentResponse, CorrectionRequest, ApproveRequest
from app.services.review_service import ReviewService
from app.services.document_service import format_document_dict

router = APIRouter(tags=["Reviews"])


@router.get("/api/documents/{document_id}/reviews", response_model=List[ReviewResponse])
def get_document_reviews(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the chronological review history for a document.
    Enforces firm boundary.
    """
    review_service = ReviewService(db)
    reviews = review_service.list_reviews_by_document(
        document_id=document_id,
        firm_id=current_user.firm_id,
    )
    result = []
    for r in reviews:
        reviewer_name = r.reviewer.name if r.reviewer else None
        result.append(
            ReviewResponse(
                id=r.id,
                firm_id=r.firm_id,
                document_id=r.document_id,
                reviewer_id=r.reviewer_id,
                reviewer_name=reviewer_name,
                decision=r.decision,
                comment=r.comment,
                created_at=r.created_at,
            )
        )
    return result
