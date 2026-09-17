from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.document_version import DocumentVersion


class DocumentRepository:
    """
    Repository for Document and DocumentVersion data access.
    Enforces tenant isolation by requiring firm_id on every operation.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, document_id: UUID, firm_id: UUID) -> Optional[Document]:
        """Fetches a document by ID strictly bounded to the firm."""
        return (
            self.db.query(Document)
            .filter(Document.id == document_id, Document.firm_id == firm_id)
            .first()
        )

    def list_by_client(self, client_id: UUID, firm_id: UUID) -> List[Document]:
        """Lists all documents for a client, ensuring both belong to firm_id."""
        return (
            self.db.query(Document)
            .filter(Document.client_id == client_id, Document.firm_id == firm_id)
            .order_by(Document.created_at.asc())
            .all()
        )

    def create(
        self,
        firm_id: UUID,
        client_id: UUID,
        name: str,
        document_type: Optional[str] = None,
        uploaded_by: Optional[UUID] = None,
    ) -> Document:
        """Creates a new document placeholder in PENDING state."""
        doc = Document(
            firm_id=firm_id,
            client_id=client_id,
            name=name,
            document_type=document_type or name.lower().replace(" ", "_"),
            status="PENDING",
            version=1,
            uploaded_by=uploaded_by,
        )
        self.db.add(doc)
        self.db.flush()
        return doc

    def create_version(
        self,
        document_id: UUID,
        firm_id: UUID,
        version_number: int,
        storage_key: str,
        original_name: str,
        mime_type: str,
        file_size: int,
        sha256_hash: str,
        uploaded_by: Optional[UUID] = None,
    ) -> DocumentVersion:
        """Creates an immutable document version record."""
        ver = DocumentVersion(
            document_id=document_id,
            firm_id=firm_id,
            version_number=version_number,
            storage_key=storage_key,
            original_name=original_name,
            mime_type=mime_type,
            file_size=file_size,
            sha256_hash=sha256_hash,
            uploaded_by=uploaded_by,
        )
        self.db.add(ver)
        self.db.flush()
        return ver

    def get_versions(self, document_id: UUID, firm_id: UUID) -> List[DocumentVersion]:
        """Returns all versions for a document ordered newest to oldest."""
        return (
            self.db.query(DocumentVersion)
            .filter(DocumentVersion.document_id == document_id, DocumentVersion.firm_id == firm_id)
            .order_by(DocumentVersion.version_number.desc())
            .all()
        )

    def get_version_by_number(
        self, document_id: UUID, firm_id: UUID, version_number: int
    ) -> Optional[DocumentVersion]:
        """Returns a specific version for a document with tenant check."""
        return (
            self.db.query(DocumentVersion)
            .filter(
                DocumentVersion.document_id == document_id,
                DocumentVersion.firm_id == firm_id,
                DocumentVersion.version_number == version_number,
            )
            .first()
        )
