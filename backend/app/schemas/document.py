import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class DocumentCreate(BaseModel):
    name: str


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    firm_id: uuid.UUID
    client_id: uuid.UUID
    name: str
    file_url: Optional[str] = None
    status: str
    uploaded_by: Optional[uuid.UUID] = None
    uploader_name: Optional[str] = None
    version: int = 1
    review_comment: Optional[str] = None
    uploaded_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class CorrectionRequest(BaseModel):
    comment: str


class ApproveRequest(BaseModel):
    comment: Optional[str] = None
