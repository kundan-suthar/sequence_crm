"""
Dashboard analytics endpoint.

GET /api/v1/dashboard/analytics
  - query param: range ("7d" | "30d", default "7d")
  - auth: require_permission("customer:view")
  - caching: Redis with TTL=300s, key scoped by role + range
"""

import json
import logging
from datetime import date, datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import is_admin, require_permission
from app.core.redis_client import get_redis
from app.db.session import get_db
from app.models.ai_insight import AIInsight
from app.models.customer import Customer
from app.models.interaction import Interaction
from app.models.user import User
from app.schemas.dashboard import (
    CustomerHealthOut,
    DashboardAnalyticsOut,
    InteractionActivityPoint,
)

logger = logging.getLogger("app.api.dashboard")

dashboard_router = APIRouter(prefix="/dashboard", tags=["dashboard"])


# ---------------------------------------------------------------------------
# Helper: percentage change
# ---------------------------------------------------------------------------

def calc_pct_change(current: int, previous: int) -> float:
    """Return percentage change from previous to current, rounded to 1 dp."""
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return round((current - previous) / previous * 100, 1)


# ---------------------------------------------------------------------------
# Helper: fill in missing dates with 0 count
# ---------------------------------------------------------------------------

def _fill_activity_dates(
    rows: list[tuple[date, int]],
    range_days: int,
) -> list[dict]:
    """
    Given (date, count) rows from the DB, produce a full list for every day
    in [today - range_days + 1 .. today], inserting 0 for missing days.
    """
    today = datetime.now(timezone.utc).date()
    start = today - timedelta(days=range_days - 1)

    count_by_date: dict[date, int] = {row[0]: row[1] for row in rows}

    result = []
    current = start
    while current <= today:
        result.append(
            {
                "date": current.isoformat(),
                "count": count_by_date.get(current, 0),
            }
        )
        current += timedelta(days=1)
    return result


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@dashboard_router.get("/analytics", response_model=DashboardAnalyticsOut)
async def get_dashboard_analytics(
    range: Literal["7d", "30d"] = Query("7d", description="Time range for interaction activity"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_permission("customer:view")),
):
    role = "admin" if is_admin(user) else "executive"
    cache_key = f"dashboard:analytics:{role}:{range}"

    # ------------------------------------------------------------------
    # Try Redis cache first
    # ------------------------------------------------------------------
    redis = get_redis()
    if redis is not None:
        try:
            cached = await redis.get(cache_key)
            if cached:
                logger.debug("Dashboard cache hit: %s", cache_key)
                return json.loads(cached)
        except Exception as exc:  # pragma: no cover
            logger.warning("Redis GET failed (%s), falling back to DB", exc)

    # ------------------------------------------------------------------
    # Compute time boundaries
    # ------------------------------------------------------------------
    now = datetime.now(timezone.utc)
    days_30_ago = now - timedelta(days=30)
    days_60_ago = now - timedelta(days=60)
    range_days = 7 if range == "7d" else 30
    range_start = now - timedelta(days=range_days)

    # ------------------------------------------------------------------
    # 1 & 2 — total_customers (current + 30d change)
    # ------------------------------------------------------------------
    total_q = select(func.count(Customer.id))
    if not is_admin(user):
        total_q = total_q.where(Customer.owner_id == user.id)
    total_customers: int = (await db.execute(total_q)).scalar_one()

    # Customers created in last 30 days
    cur_cust_q = select(func.count(Customer.id)).where(Customer.created_at >= days_30_ago)
    if not is_admin(user):
        cur_cust_q = cur_cust_q.where(Customer.owner_id == user.id)
    cur_cust: int = (await db.execute(cur_cust_q)).scalar_one()

    # Customers created in prior 30 days (30-60 days ago)
    prev_cust_q = select(func.count(Customer.id)).where(
        Customer.created_at >= days_60_ago,
        Customer.created_at < days_30_ago,
    )
    if not is_admin(user):
        prev_cust_q = prev_cust_q.where(Customer.owner_id == user.id)
    prev_cust: int = (await db.execute(prev_cust_q)).scalar_one()

    total_customers_change_pct = calc_pct_change(cur_cust, prev_cust)

    # ------------------------------------------------------------------
    # 3 & 4 — active_interactions (last 30d + change)
    # ------------------------------------------------------------------
    active_q = select(func.count(Interaction.id)).where(
        Interaction.occurred_at >= days_30_ago
    )
    active_interactions: int = (await db.execute(active_q)).scalar_one()

    prev_interactions_q = select(func.count(Interaction.id)).where(
        Interaction.occurred_at >= days_60_ago,
        Interaction.occurred_at < days_30_ago,
    )
    prev_interactions: int = (await db.execute(prev_interactions_q)).scalar_one()

    active_interactions_change_pct = calc_pct_change(active_interactions, prev_interactions)

    # ------------------------------------------------------------------
    # 5 & 6 — at_risk_customers + change
    # ------------------------------------------------------------------
    at_risk_statuses = ("at_risk", "churned")

    at_risk_q = select(func.count(Customer.id)).where(
        Customer.status.in_(at_risk_statuses)
    )
    if not is_admin(user):
        at_risk_q = at_risk_q.where(Customer.owner_id == user.id)
    at_risk_customers: int = (await db.execute(at_risk_q)).scalar_one()

    # At-risk customers updated (or created) in last 30 days
    cur_risk_q = select(func.count(Customer.id)).where(
        Customer.status.in_(at_risk_statuses),
        Customer.updated_at >= days_30_ago,
    )
    if not is_admin(user):
        cur_risk_q = cur_risk_q.where(Customer.owner_id == user.id)
    cur_risk: int = (await db.execute(cur_risk_q)).scalar_one()

    prev_risk_q = select(func.count(Customer.id)).where(
        Customer.status.in_(at_risk_statuses),
        Customer.updated_at >= days_60_ago,
        Customer.updated_at < days_30_ago,
    )
    if not is_admin(user):
        prev_risk_q = prev_risk_q.where(Customer.owner_id == user.id)
    prev_risk: int = (await db.execute(prev_risk_q)).scalar_one()

    at_risk_change_pct = calc_pct_change(cur_risk, prev_risk)

    # ------------------------------------------------------------------
    # 7 & 8 — ai_insights_generated + change
    # ------------------------------------------------------------------
    insights_q = select(func.count(AIInsight.id)).where(AIInsight.status == "success")
    ai_insights_generated: int = (await db.execute(insights_q)).scalar_one()

    cur_insights_q = select(func.count(AIInsight.id)).where(
        AIInsight.status == "success",
        AIInsight.created_at >= days_30_ago,
    )
    cur_insights: int = (await db.execute(cur_insights_q)).scalar_one()

    prev_insights_q = select(func.count(AIInsight.id)).where(
        AIInsight.status == "success",
        AIInsight.created_at >= days_60_ago,
        AIInsight.created_at < days_30_ago,
    )
    prev_insights: int = (await db.execute(prev_insights_q)).scalar_one()

    ai_insights_change_pct = calc_pct_change(cur_insights, prev_insights)

    # ------------------------------------------------------------------
    # 9 — interaction_activity (grouped by day for selected range)
    # ------------------------------------------------------------------
    if is_admin(user):
        activity_q = (
            select(
                func.date(Interaction.occurred_at).label("day"),
                func.count(Interaction.id).label("cnt"),
            )
            .where(Interaction.occurred_at >= range_start)
            .group_by(func.date(Interaction.occurred_at))
            .order_by(func.date(Interaction.occurred_at).asc())
        )
    else:
        # Executive: only interactions whose customer is owned by this user
        activity_q = (
            select(
                func.date(Interaction.occurred_at).label("day"),
                func.count(Interaction.id).label("cnt"),
            )
            .join(Customer, Interaction.customer_id == Customer.id)
            .where(
                Interaction.occurred_at >= range_start,
                Customer.owner_id == user.id,
            )
            .group_by(func.date(Interaction.occurred_at))
            .order_by(func.date(Interaction.occurred_at).asc())
        )

    activity_rows = (await db.execute(activity_q)).all()
    # Rows are (date | str, int) depending on the DB driver; normalise to date objects
    normalised_rows: list[tuple[date, int]] = []
    for row in activity_rows:
        day_val = row[0]
        if isinstance(day_val, str):
            day_val = date.fromisoformat(day_val)
        normalised_rows.append((day_val, row[1]))

    interaction_activity = _fill_activity_dates(normalised_rows, range_days)

    # ------------------------------------------------------------------
    # 10 — customer_health
    # ------------------------------------------------------------------
    health_q = select(
        func.count(Customer.id).filter(Customer.status == "active").label("healthy"),
        func.count(Customer.id).filter(Customer.status == "prospect").label("stagnant"),
        func.count(Customer.id)
        .filter(Customer.status.in_(("at_risk", "churned")))
        .label("churn_risk"),
    )
    if not is_admin(user):
        health_q = health_q.where(Customer.owner_id == user.id)

    health_row = (await db.execute(health_q)).one()
    customer_health = {
        "healthy": health_row.healthy,
        "stagnant": health_row.stagnant,
        "churn_risk": health_row.churn_risk,
    }

    # ------------------------------------------------------------------
    # Assemble response
    # ------------------------------------------------------------------
    data = {
        "total_customers": total_customers,
        "total_customers_change_pct": total_customers_change_pct,
        "active_interactions": active_interactions,
        "active_interactions_change_pct": active_interactions_change_pct,
        "at_risk_customers": at_risk_customers,
        "at_risk_change_pct": at_risk_change_pct,
        "ai_insights_generated": ai_insights_generated,
        "ai_insights_change_pct": ai_insights_change_pct,
        "interaction_activity": interaction_activity,
        "customer_health": customer_health,
    }

    # ------------------------------------------------------------------
    # Write to Redis cache
    # ------------------------------------------------------------------
    if redis is not None:
        try:
            await redis.set(cache_key, json.dumps(data), ex=300)
            logger.debug("Dashboard cache set: %s (TTL=300s)", cache_key)
        except Exception as exc:  # pragma: no cover
            logger.warning("Redis SET failed (%s), continuing without cache", exc)

    return data
