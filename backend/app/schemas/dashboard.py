from pydantic import BaseModel


class InteractionActivityPoint(BaseModel):
    """One entry in the interaction activity bar chart data."""
    date: str  # YYYY-MM-DD format
    count: int


class CustomerHealthOut(BaseModel):
    """Health bucket counts for the donut chart."""
    healthy: int
    stagnant: int
    churn_risk: int


class DashboardAnalyticsOut(BaseModel):
    """Full analytics response for the dashboard overview endpoint."""
    total_customers: int
    total_customers_change_pct: float
    active_interactions: int
    active_interactions_change_pct: float
    at_risk_customers: int
    at_risk_change_pct: float
    ai_insights_generated: int
    ai_insights_change_pct: float
    interaction_activity: list[InteractionActivityPoint]
    customer_health: CustomerHealthOut
