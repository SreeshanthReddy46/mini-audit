import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, BigInteger, DateTime, ForeignKey, Uuid, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class DocumentVersion(Base):
    """
    Immutable document version record.
    Every upload or re-upload creates a new document version rather than overwriting.
    Stores cryptographic SHA-256 fingerprint, file size, MIME type, and private storage key.
    """
    __tablename__ = "document_versions"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    document_id = Column(Uuid, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    firm_id = Column(Uuid, ForeignKey("firms.id", ondelete="CASCADE"), nullable=False, index=True)

    version_number = Column(Integer, nullable=False, default=1)

    storage_key = Column(Text, nullable=False)
    original_name = Column(String(255), nullable=False)

    mime_type = Column(String(100), nullable=False, default="application/octet-stream")
    file_size = Column(BigInteger, nullable=False, default=0)

    sha256_hash = Column(String(64), nullable=False, index=True)

    uploaded_by = Column(Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    document = relationship("Document", back_populates="versions")
    firm = relationship("Firm")
    uploader = relationship("User")
    analyses = relationship("AIAnalysis", back_populates="version", cascade="all, delete-orphan")
