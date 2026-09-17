import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Uuid
from sqlalchemy.orm import relationship
from app.core.database import Base


class Firm(Base):
    __tablename__ = "firms"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    users = relationship("User", back_populates="firm", cascade="all, delete-orphan")
    clients = relationship("Client", back_populates="firm", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="firm", cascade="all, delete-orphan")
    audit_events = relationship("AuditEvent", back_populates="firm", cascade="all, delete-orphan")
