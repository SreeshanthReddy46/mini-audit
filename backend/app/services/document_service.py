import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.client import Client
from app.models.document_version import DocumentVersion
from app.models.review import Review
from app.services.storage_service import save_file_locally, storage_service
from app.services.audit_service import log_audit_event
from app.utils.hashing import calculate_sha256


def format_document_dict(doc: Document) -> dict:
    """Format Document model instance into serializable dictionary with versions."""
    uploader_name = doc.uploader.name if doc.uploader else None
    versions_list = []
    if getattr(doc, "versions", None):
        for v in doc.versions:
            versions_list.append({
                "id": v.id,
                "document_id": v.document_id,
                "version_number": v.version_number,
                "original_name": v.original_name,
                "mime_type": v.mime_type,
                "file_size": v.file_size,
                "sha256_hash": v.sha256_hash,
                "uploaded_by": v.uploaded_by,
                "uploader_name": v.uploader.name if getattr(v, "uploader", None) else None,
                "created_at": v.created_at,
            })

    return {
        "id": doc.id,
        "firm_id": doc.firm_id,
        "client_id": doc.client_id,
        "name": doc.name,
        "file_url": doc.file_url,
        "status": doc.status,
        "uploaded_by": doc.uploaded_by,
        "uploader_name": uploader_name,
        "version": doc.version,
        "review_comment": doc.review_comment,
        "uploaded_at": doc.uploaded_at,
        "created_at": doc.created_at,
        "updated_at": doc.updated_at,
        "versions": versions_list,
    }


def get_documents_for_client(db: Session, client_id: uuid.UUID, firm_id: uuid.UUID) -> List[dict]:
    """Retrieve documents for a client, ensuring both client and documents belong to firm_id."""
    # Confirm client belongs to firm
    client = db.query(Client).filter(Client.id == client_id, Client.firm_id == firm_id).first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")

    docs = (
        db.query(Document)
        .filter(Document.client_id == client_id, Document.firm_id == firm_id)
        .order_by(Document.created_at.asc())
        .all()
    )
    return [format_document_dict(doc) for doc in docs]


def create_document_placeholder(
    db: Session,
    client_id: uuid.UUID,
    firm_id: uuid.UUID,
    name: str,
    actor_id: uuid.UUID
) -> dict:
    """Create a new compliance document requirement for a client."""
    client = db.query(Client).filter(Client.id == client_id, Client.firm_id == firm_id).first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")

    doc = Document(
        firm_id=firm_id,
        client_id=client_id,
        name=name.strip(),
        status="PENDING",
        version=1
    )
    db.add(doc)
    db.flush()

    log_audit_event(
        db=db,
        firm_id=firm_id,
        actor_id=actor_id,
        document_id=doc.id,
        client_id=client_id,
        action="DOCUMENT_ADDED",
        comment=f"Required audit document '{doc.name}' created",
        metadata_json={"document_name": doc.name, "status": "PENDING"}
    )
    db.commit()
    db.refresh(doc)
    return format_document_dict(doc)


def get_document_by_id(db: Session, document_id: uuid.UUID, firm_id: uuid.UUID) -> dict:
    """Retrieve a single document, enforcing firm_id boundary."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.firm_id == firm_id
    ).first()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    return format_document_dict(doc)


def upload_document_file(
    db: Session,
    document_id: uuid.UUID,
    firm_id: uuid.UUID,
    actor_id: uuid.UUID,
    file: UploadFile
) -> dict:
    """Upload an audit document file (status becomes UPLOADED)."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.firm_id == firm_id
    ).first()

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if doc.status not in ["PENDING", "CORRECTION_REQUIRED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot upload file when document status is '{doc.status}'. Use re-upload for corrections."
        )

    storage_filename, file_size = save_file_locally(firm_id, file)

    # Compute SHA-256 fingerprint
    file_bytes = storage_service.retrieve_file(storage_filename) or b""
    sha256_digest = calculate_sha256(file_bytes) if file_bytes else "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

    old_status = doc.status
    doc.file_url = storage_filename
    doc.status = "UPLOADED"
    doc.uploaded_by = actor_id
    doc.uploaded_at = datetime.now(timezone.utc)

    # Create immutable DocumentVersion record
    doc_ver = DocumentVersion(
        document_id=doc.id,
        firm_id=firm_id,
        version_number=doc.version,
        storage_key=storage_filename,
        original_name=file.filename or "document.pdf",
        mime_type=file.content_type or "application/pdf",
        file_size=file_size,
        sha256_hash=sha256_digest,
        uploaded_by=actor_id,
    )
    db.add(doc_ver)

    # Atomic audit logging in the same transaction
    log_audit_event(
        db=db,
        firm_id=firm_id,
        actor_id=actor_id,
        document_id=doc.id,
        client_id=doc.client_id,
        action="DOCUMENT_UPLOADED",
        comment=f"Uploaded document '{doc.name}' ({file.filename})",
        metadata_json={
            "filename": file.filename,
            "file_size": file_size,
            "sha256": sha256_digest,
            "version": doc.version,
            "old_status": old_status,
            "new_status": "UPLOADED"
        }
    )
    db.commit()
    db.refresh(doc)
    return format_document_dict(doc)


def start_document_review(
    db: Session,
    document_id: uuid.UUID,
    firm_id: uuid.UUID,
    actor_id: uuid.UUID
) -> dict:
    """Reviewer initiates review on an uploaded document (status becomes UNDER_REVIEW)."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.firm_id == firm_id
    ).first()

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if doc.status != "UPLOADED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot start review: document status must be 'UPLOADED', but is currently '{doc.status}'."
        )

    doc.status = "UNDER_REVIEW"

    log_audit_event(
        db=db,
        firm_id=firm_id,
        actor_id=actor_id,
        document_id=doc.id,
        client_id=doc.client_id,
        action="REVIEW_STARTED",
        comment=f"Started review of '{doc.name}' (v{doc.version})",
        metadata_json={"version": doc.version, "status": "UNDER_REVIEW"}
    )
    db.commit()
    db.refresh(doc)
    return format_document_dict(doc)


def request_document_correction(
    db: Session,
    document_id: uuid.UUID,
    firm_id: uuid.UUID,
    actor_id: uuid.UUID,
    comment: str
) -> dict:
    """Reviewer requests correction, mandating a descriptive reason."""
    clean_comment = comment.strip() if comment else ""
    if not clean_comment:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A specific correction reason or comment is required."
        )

    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.firm_id == firm_id
    ).first()

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if doc.status != "UNDER_REVIEW":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot request correction: document must be 'UNDER_REVIEW', currently '{doc.status}'."
        )

    doc.status = "CORRECTION_REQUIRED"
    doc.review_comment = clean_comment

    # Record Review decision
    review_record = Review(
        firm_id=firm_id,
        document_id=doc.id,
        reviewer_id=actor_id,
        decision="CORRECTION_REQUIRED",
        comment=clean_comment,
    )
    db.add(review_record)

    log_audit_event(
        db=db,
        firm_id=firm_id,
        actor_id=actor_id,
        document_id=doc.id,
        client_id=doc.client_id,
        action="CORRECTION_REQUESTED",
        comment=clean_comment,
        metadata_json={"version": doc.version, "status": "CORRECTION_REQUIRED", "reason": clean_comment}
    )
    db.commit()
    db.refresh(doc)
    return format_document_dict(doc)


def reupload_document_file(
    db: Session,
    document_id: uuid.UUID,
    firm_id: uuid.UUID,
    actor_id: uuid.UUID,
    file: UploadFile
) -> dict:
    """Staff re-uploads corrected file in response to correction request (increments version)."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.firm_id == firm_id
    ).first()

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if doc.status != "CORRECTION_REQUIRED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot re-upload: document status must be 'CORRECTION_REQUIRED', currently '{doc.status}'."
        )

    storage_filename, file_size = save_file_locally(firm_id, file)
    file_bytes = storage_service.retrieve_file(storage_filename) or b""
    sha256_digest = calculate_sha256(file_bytes) if file_bytes else "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

    previous_version = doc.version
    doc.version += 1
    doc.file_url = storage_filename
    doc.status = "UPLOADED"
    doc.uploaded_by = actor_id
    doc.uploaded_at = datetime.now(timezone.utc)
    # Note: Keep doc.review_comment as context or clear it
    prior_comment = doc.review_comment

    # Create immutable DocumentVersion record for the incremented version
    doc_ver = DocumentVersion(
        document_id=doc.id,
        firm_id=firm_id,
        version_number=doc.version,
        storage_key=storage_filename,
        original_name=file.filename or "document.pdf",
        mime_type=file.content_type or "application/pdf",
        file_size=file_size,
        sha256_hash=sha256_digest,
        uploaded_by=actor_id,
    )
    db.add(doc_ver)

    log_audit_event(
        db=db,
        firm_id=firm_id,
        actor_id=actor_id,
        document_id=doc.id,
        client_id=doc.client_id,
        action="DOCUMENT_REUPLOADED",
        comment=f"Uploaded revised document (version {doc.version}) addressing feedback: '{prior_comment}'",
        metadata_json={
            "previous_version": previous_version,
            "new_version": doc.version,
            "filename": file.filename,
            "file_size": file_size,
            "sha256": sha256_digest,
            "status": "UPLOADED"
        }
    )
    db.commit()
    db.refresh(doc)
    return format_document_dict(doc)


def approve_document(
    db: Session,
    document_id: uuid.UUID,
    firm_id: uuid.UUID,
    actor_id: uuid.UUID,
    comment: Optional[str] = None
) -> dict:
    """Reviewer approves the document (transitions to APPROVED)."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.firm_id == firm_id
    ).first()

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    if doc.status != "UNDER_REVIEW":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve: document must be 'UNDER_REVIEW', currently '{doc.status}'."
        )

    doc.status = "APPROVED"
    doc.review_comment = comment or "Document approved without comments."

    # Record Review decision
    review_record = Review(
        firm_id=firm_id,
        document_id=doc.id,
        reviewer_id=actor_id,
        decision="APPROVED",
        comment=doc.review_comment,
    )
    db.add(review_record)

    log_audit_event(
        db=db,
        firm_id=firm_id,
        actor_id=actor_id,
        document_id=doc.id,
        client_id=doc.client_id,
        action="DOCUMENT_APPROVED",
        comment=doc.review_comment,
        metadata_json={"version": doc.version, "status": "APPROVED"}
    )
    db.commit()
    db.refresh(doc)
    return format_document_dict(doc)
