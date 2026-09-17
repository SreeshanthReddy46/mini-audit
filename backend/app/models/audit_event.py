import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Uuid, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class AuditEvent(Base):
    """
    Append-only immutable audit trail record.
    Tracks security and workflow actions with actor attribution, client/entity context,
    IP address, user agent, and timestamp.
    """
    __tablename__ = "audit_events"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    firm_id = Column(Uuid, ForeignKey("firms.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(Uuid, ForeignKey("documents.id", ondelete="CASCADE"), nullable=True, index=True)
    actor_id = Column(Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    action = Column(String(100), nullable=False, index=True)
    entity_type = Column(String(50), nullable=True, default="document")
    entity_id = Column(Uuid, nullable=True)

    comment = Column(Text, nullable=True)
    metadata_json = Column(JSON, default=dict, nullable=False)

    ip_address = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    firm = relationship("Firm", back_populates="audit_events")
    document = relationship("Document", back_populates="audit_events")
    actor = relationship("User", back_populates="audit_events")
