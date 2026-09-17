import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_reviewer, require_staff
from app.models.user import User
from app.schemas.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentVersionResponse,
    CorrectionRequest,
    ApproveRequest,
)
from app.repositories.document_repository import DocumentRepository
from app.schemas.audit import AuditEventResponse
from app.services.document_service import (
    get_documents_for_client,
    create_document_placeholder,
    get_document_by_id,
    upload_document_file,
    start_document_review,
    request_document_correction,
    reupload_document_file,
    approve_document
)
from app.services.audit_service import get_audit_history_for_document
from app.services.storage_service import get_file_path

router = APIRouter(tags=["Documents"])


@router.get("/api/clients/{client_id}/documents", response_model=List[DocumentResponse])
def list_client_documents(
    client_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve compliance documents for client, verifying firm boundary."""
    return get_documents_for_client(db, client_id, current_user.firm_id)


@router.post("/api/clients/{client_id}/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def create_document(
    client_id: uuid.UUID,
    doc_in: DocumentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new compliance document placeholder for client."""
    if not doc_in.name.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Document name required.")
    return create_document_placeholder(
        db=db,
        client_id=client_id,
        firm_id=current_user.firm_id,
        name=doc_in.name,
        actor_id=current_user.id
    )


@router.get("/api/documents/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get document metadata.
    Enforces Document.firm_id == current_user.firm_id.
    Returns 404 if in another firm.
    """
    return get_document_by_id(db, document_id, current_user.firm_id)


@router.post("/api/documents/{document_id}/upload", response_model=DocumentResponse)
def upload_document(
    document_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload initial document file (PDF, CSV, XLSX <= 10MB). Sets status to UPLOADED."""
    return upload_document_file(
        db=db,
        document_id=document_id,
        firm_id=current_user.firm_id,
        actor_id=current_user.id,
        file=file
    )


@router.get("/api/documents/{document_id}/file")
def stream_document_file(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Private file streaming.
    Authenticates user, verifies tenant boundary, and safely streams file.
    No public file URLs are ever exposed.
    """
    doc = get_document_by_id(db, document_id, current_user.firm_id)
    if not doc["file_url"]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No file has been uploaded for this document.")

    file_path = get_file_path(current_user.firm_id, doc["file_url"])
    return FileResponse(
        path=str(file_path),
        filename=f"{doc['name']}{file_path.suffix}",
        media_type="application/octet-stream"
    )


@router.post("/api/documents/{document_id}/start-review", response_model=DocumentResponse)
def start_review(
    document_id: uuid.UUID,
    current_user: User = Depends(require_reviewer),
    db: Session = Depends(get_db)
):
    """
    REVIEWER ONLY: Transition UPLOADED -> UNDER_REVIEW.
    Staff attempting this receives 403 Forbidden.
    """
    return start_document_review(
        db=db,
        document_id=document_id,
        firm_id=current_user.firm_id,
        actor_id=current_user.id
    )


@router.post("/api/documents/{document_id}/request-correction", response_model=DocumentResponse)
def request_correction(
    document_id: uuid.UUID,
    req: CorrectionRequest,
    current_user: User = Depends(require_reviewer),
    db: Session = Depends(get_db)
):
    """
    REVIEWER ONLY: Transition UNDER_REVIEW -> CORRECTION_REQUIRED.
    Requires mandatory comment.
    """
    return request_document_correction(
        db=db,
        document_id=document_id,
        firm_id=current_user.firm_id,
        actor_id=current_user.id,
        comment=req.comment
    )


@router.post("/api/documents/{document_id}/reupload", response_model=DocumentResponse)
def reupload_document(
    document_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Respond to correction request by uploading revised document.
    Increments version and resets status to UPLOADED.
    """
    return reupload_document_file(
        db=db,
        document_id=document_id,
        firm_id=current_user.firm_id,
        actor_id=current_user.id,
        file=file
    )


@router.post("/api/documents/{document_id}/approve", response_model=DocumentResponse)
def approve(
    document_id: uuid.UUID,
    req: ApproveRequest = ApproveRequest(),
    current_user: User = Depends(require_reviewer),
    db: Session = Depends(get_db)
):
    """
    REVIEWER ONLY: Transition UNDER_REVIEW -> APPROVED.
    Staff attempting this receives 403 Forbidden.
    """
    return approve_document(
        db=db,
        document_id=document_id,
        firm_id=current_user.firm_id,
        actor_id=current_user.id,
        comment=req.comment
    )


@router.get("/api/documents/{document_id}/audit", response_model=List[AuditEventResponse])
def get_document_audit_history(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve chronological audit trail for this document.
    Strictly scoped by firm_id. Append-only (no modification endpoints).
    """
    get_document_by_id(db, document_id, current_user.firm_id)
    return get_audit_history_for_document(db, document_id, current_user.firm_id)


@router.get("/api/documents/{document_id}/versions", response_model=List[DocumentVersionResponse])
def get_document_versions(
    document_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve all immutable versions for a document.
    Enforces firm boundary.
    """
    get_document_by_id(db, document_id, current_user.firm_id)
    repo = DocumentRepository(db)
    versions = repo.get_versions(document_id, current_user.firm_id)
    return [
        DocumentVersionResponse(
            id=v.id,
            document_id=v.document_id,
            version_number=v.version_number,
            original_name=v.original_name,
            mime_type=v.mime_type,
            file_size=v.file_size,
            sha256_hash=v.sha256_hash,
            uploaded_by=v.uploaded_by,
            uploader_name=v.uploader.name if getattr(v, "uploader", None) else None,
            created_at=v.created_at,
        )
        for v in versions
    ]
