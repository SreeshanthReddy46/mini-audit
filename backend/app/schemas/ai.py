import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class FindingItem(BaseModel):
    category: str = Field(..., description="e.g. MISSING_INFORMATION, CALCULATION_MISMATCH, COMPLIANCE_RISK, OBSERVATION")
    severity: str = Field(default="MEDIUM", description="LOW, MEDIUM, HIGH")
    title: str
    description: str
    evidence: str = Field(..., description="Direct quote or reference to section in document")
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    recommendation: str


class AIAnalysisStructuredOutput(BaseModel):
    document_type: str
    summary: str
    findings: List[FindingItem] = []
    overall_confidence: float = 0.88


class AIAnalysisRequest(BaseModel):
    version_id: Optional[uuid.UUID] = None


class AIAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    document_id: uuid.UUID
    version_id: Optional[uuid.UUID] = None
    status: str  # QUEUED, PROCESSING, COMPLETED, FAILED
    model: str
    prompt_version: str
    summary: Optional[str] = None
    findings: List[FindingItem] = []
    overall_confidence: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
