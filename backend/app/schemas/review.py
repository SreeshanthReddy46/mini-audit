import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ReviewCreate(BaseModel):
    decision: str
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    firm_id: uuid.UUID
    document_id: uuid.UUID
    reviewer_id: Optional[uuid.UUID] = None
    reviewer_name: Optional[str] = None
    decision: str
    comment: Optional[str] = None
    created_at: datetime
