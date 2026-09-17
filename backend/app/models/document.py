import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    firm_id = Column(Uuid, ForeignKey("firms.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id = Column(Uuid, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String(255), nullable=False)  # e.g. "Bank Statement"
    file_url = Column(String(500), nullable=True)  # Storage key or URL
    status = Column(String(50), nullable=False, default="PENDING", index=True)
    # Valid statuses: 'PENDING', 'UPLOADED', 'UNDER_REVIEW', 'CORRECTION_REQUIRED', 'APPROVED'

    uploaded_by = Column(Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    version = Column(Integer, default=1, nullable=False)
    review_comment = Column(Text, nullable=True)

    uploaded_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    firm = relationship("Firm", back_populates="documents")
    client = relationship("Client", back_populates="documents")
    uploader = relationship("User", back_populates="uploaded_documents")
    audit_events = relationship("AuditEvent", back_populates="document", cascade="all, delete-orphan")
