import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.core.database import Base


class Document(Base):
    """
    Core document model representing an audit checklist artifact.
    Tracks lifecycle status: PENDING -> UPLOADED -> UNDER_REVIEW -> (APPROVED | CORRECTION_REQUIRED).
    Maintains relational links to all immutable versions, reviews, and advisory AI analyses.
    """
    __tablename__ = "documents"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    firm_id = Column(Uuid, ForeignKey("firms.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id = Column(Uuid, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String(255), nullable=False)
    document_type = Column(String(100), nullable=True)
    file_url = Column(String(500), nullable=True)
    status = Column(String(50), nullable=False, default="PENDING", index=True)

    version = Column(Integer, default=1, nullable=False)
    review_comment = Column(Text, nullable=True)

    uploaded_by = Column(Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_by = Column(Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    uploaded_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    firm = relationship("Firm", back_populates="documents")
    client = relationship("Client", back_populates="documents")
    uploader = relationship("User", foreign_keys=[uploaded_by], back_populates="uploaded_documents")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    audit_events = relationship("AuditEvent", back_populates="document", cascade="all, delete-orphan")
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan", order_by="DocumentVersion.version_number.desc()")
    reviews = relationship("Review", back_populates="document", cascade="all, delete-orphan", order_by="Review.created_at.desc()")
    analyses = relationship("AIAnalysis", back_populates="document", cascade="all, delete-orphan", order_by="AIAnalysis.created_at.desc()")
