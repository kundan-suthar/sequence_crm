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


class AIInsightOut(BaseModel):
    id: int
    interaction_id: int
    summary: str | None
    sentiment: str | None
    action_items: list | None
    risks: list | None
    status: str
    error_message: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


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


class InteractionWithInsightOut(InteractionOut):
    """Returned from create endpoint — includes the generated AI insight."""
    ai_insight: AIInsightOut | None = None
