import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    """
    Firm user model with role-based access control (STAFF, REVIEWER, ADMIN).
    Every user is strictly bound to exactly one firm_id.
    """
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    firm_id = Column(Uuid, ForeignKey("firms.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # 'STAFF', 'REVIEWER', 'ADMIN'
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=True)

    # Relationships
    firm = relationship("Firm", back_populates="users")
    uploaded_documents = relationship("Document", foreign_keys="Document.uploaded_by", back_populates="uploader")
    audit_events = relationship("AuditEvent", back_populates="actor")
