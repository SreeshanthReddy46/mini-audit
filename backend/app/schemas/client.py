import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional


class ClientCreate(BaseModel):
    name: str


class ClientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    firm_id: uuid.UUID
    name: str
    created_at: datetime
    document_count: Optional[int] = 0
