import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Uuid, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    firm_id = Column(Uuid, ForeignKey("firms.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(Uuid, ForeignKey("documents.id", ondelete="CASCADE"), nullable=True, index=True)
    actor_id = Column(Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    action = Column(String(100), nullable=False)
    # Actions: 'CLIENT_CREATED', 'DOCUMENT_ADDED', 'DOCUMENT_UPLOADED', 'REVIEW_STARTED',
    #          'CORRECTION_REQUESTED', 'DOCUMENT_REUPLOADED', 'DOCUMENT_APPROVED'

    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    metadata_json = Column(JSON, default=dict, nullable=False)

    # Relationships
    firm = relationship("Firm", back_populates="audit_events")
    document = relationship("Document", back_populates="audit_events")
    actor = relationship("User", back_populates="audit_events")
