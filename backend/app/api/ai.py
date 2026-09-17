import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.ai import AIAnalysisResponse, AIAnalysisRequest, FindingItem
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/documents", tags=["AI Advisory"])


@router.post("/{document_id}/analyze", response_model=AIAnalysisResponse)
def trigger_ai_analysis(
    document_id: uuid.UUID,
    request_in: Optional[AIAnalysisRequest] = None,
    current_user: User = Depends(get_current_user),
    request: Request = None,
    db: Session = Depends(get_db),
):
    """
    Triggers restricted advisory AI analysis for a document.
    Deterministic backend rules govern access, tenancy, and workflow states.
    The AI cannot approve or modify document state.
    """
    ai_service = AIService(db)
    client_ip = request.client.host if request and request.client else None
    user_agent = request.headers.get("User-Agent") if request else None

    version_id = request_in.version_id if request_in else None
    analysis = ai_service.analyze_document(
        document_id=document_id,
        firm_id=current_user.firm_id,
        user_id=current_user.id,
        version_id=version_id,
        ip_address=client_ip,
        user_agent=user_agent,
    )

    findings_items = [FindingItem(**f) if isinstance(f, dict) else f for f in analysis.findings]

    return AIAnalysisResponse(
        id=analysis.id,
        document_id=analysis.document_id,
        version_id=analysis.version_id,
        status=analysis.status,
        model=analysis.model,
        prompt_version=analysis.prompt_version,
        summary=analysis.summary,
        findings=findings_items,
        overall_confidence=analysis.overall_confidence,
        created_at=analysis.created_at,
        completed_at=analysis.completed_at,
    )


@router.get("/{document_id}/analysis", response_model=AIAnalysisResponse)
def get_latest_analysis(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves the latest completed advisory analysis for a document.
    Strictly isolated by firm_id.
    """
    ai_service = AIService(db)
    analysis = ai_service.get_latest_analysis(
        document_id=document_id,
        firm_id=current_user.firm_id,
    )

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No AI analysis found for this document.",
        )

    findings_items = [FindingItem(**f) if isinstance(f, dict) else f for f in analysis.findings]

    return AIAnalysisResponse(
        id=analysis.id,
        document_id=analysis.document_id,
        version_id=analysis.version_id,
        status=analysis.status,
        model=analysis.model,
        prompt_version=analysis.prompt_version,
        summary=analysis.summary,
        findings=findings_items,
        overall_confidence=analysis.overall_confidence,
        created_at=analysis.created_at,
        completed_at=analysis.completed_at,
    )
