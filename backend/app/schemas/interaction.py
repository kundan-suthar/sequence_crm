from datetime import datetime
from pydantic import BaseModel


class InteractionCreate(BaseModel):
    customer_id: int
    type: str  # call, meeting, email
    title: str
    notes: str
    occurred_at: datetime


class InteractionUpdate(BaseModel):
    type: str | None = None
    title: str | None = None
    notes: str | None = None
    occurred_at: datetime | None = None


class InteractionOut(BaseModel):
    id: int
    customer_id: int
    created_by: int
    type: str
    title: str
    notes: str
    occurred_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
