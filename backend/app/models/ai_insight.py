from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base

if TYPE_CHECKING:
    from .interaction import Interaction


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    interaction_id: Mapped[int] = mapped_column(
        ForeignKey("interactions.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    sentiment: Mapped[str | None] = mapped_column(String(20), nullable=True)  # positive, neutral, negative
    action_items: Mapped[list | None] = mapped_column(JSON, nullable=True)   # ["item1", "item2"]
    risks: Mapped[list | None] = mapped_column(JSON, nullable=True)          # ["risk1", "risk2"]

    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, success, failed
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)  # populated if status=failed

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    interaction: Mapped["Interaction"] = relationship(back_populates="ai_insight")