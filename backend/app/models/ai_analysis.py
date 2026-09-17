import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Uuid, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class AIAnalysis(Base):
    """
    Advisory AI analysis record bound to a specific document version.
    The AI agent never mutates document status; it only populates advisory findings.
    """
    __tablename__ = "ai_analyses"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    firm_id = Column(Uuid, ForeignKey("firms.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(Uuid, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    version_id = Column(Uuid, ForeignKey("document_versions.id", ondelete="CASCADE"), nullable=True, index=True)

    status = Column(String(50), nullable=False, default="QUEUED")  # QUEUED, PROCESSING, COMPLETED, FAILED

    model = Column(String(100), nullable=False, default="mini-audit-advisory-v1")
    prompt_version = Column(String(50), nullable=False, default="audit-guardrails-1.0")

    summary = Column(Text, nullable=True)
    findings = Column(JSON, default=list, nullable=False)
    overall_confidence = Column(String(10), default="0.90", nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    firm = relationship("Firm")
    document = relationship("Document", back_populates="analyses")
    version = relationship("DocumentVersion", back_populates="analyses")
