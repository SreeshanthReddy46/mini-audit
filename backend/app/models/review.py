import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.core.database import Base


class Review(Base):
    """
    Formal reviewer decision record.
    Preserves historical reviewer decisions (APPROVED or CORRECTION_REQUIRED) with mandatory rationale.
    """
    __tablename__ = "reviews"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    firm_id = Column(Uuid, ForeignKey("firms.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(Uuid, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    decision = Column(String(50), nullable=False)
    comment = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    firm = relationship("Firm")
    document = relationship("Document", back_populates="reviews")
    reviewer = relationship("User")
