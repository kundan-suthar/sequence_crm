# Design: Dashboard Overview

## Architecture Overview

The feature spans both backend (FastAPI) and frontend (Next.js). The backend adds a new dashboard router with an analytics endpoint backed by Redis Cloud caching. The frontend adds a full dashboard page with Recharts-powered charts.

---

## Backend Design

### New Files
- `backend/app/core/redis_client.py` — async Redis client singleton using `redis.asyncio`
- `backend/app/api/v1/dashboard.py` — dashboard analytics router
- `backend/app/schemas/dashboard.py` — Pydantic response schemas

### Modified Files
- `backend/app/main.py` — register dashboard router
- `backend/pyproject.toml` — add `redis[asyncio]` dependency
- `backend/.env` — add `REDIS_URL` variable (documented; user fills in value)
- `backend/app/core/config.py` — add `REDIS_URL` setting

### Redis Client (`app/core/redis_client.py`)

```python
# Uses redis.asyncio for non-blocking async operations
# Connection via REDIS_URL env variable (Redis Cloud format)
# Module-level client instance initialised at import time
# get_redis() dependency returns the client
# Handles ConnectionError gracefully — callers catch and fall back to DB
```

### Analytics Endpoint (`GET /api/v1/dashboard/analytics`)

**Query Parameters:**
- `range: Literal["7d", "30d"] = "7d"`

**Response Schema (`DashboardAnalyticsOut`):**
```json
{
  "total_customers": 1284,
  "total_customers_change_pct": 4.2,
  "active_interactions": 452,
  "active_interactions_change_pct": 12.5,
  "at_risk_customers": 18,
  "at_risk_change_pct": -2.1,
  "ai_insights_generated": 89,
  "ai_insights_change_pct": 28.0,
  "interaction_activity": [
    { "date": "2024-01-15", "count": 12 }
  ],
  "customer_health": {
    "healthy": 899,
    "stagnant": 257,
    "churn_risk": 128
  }
}
```

**Cache Strategy:**
- Key: `dashboard:analytics:{role}:{range}` (e.g. `dashboard:analytics:admin:7d`)
- TTL: 300 seconds
- Try GET from Redis → on hit return parsed JSON → on miss query DB → SET in Redis → return data
- Wrap Redis calls in `try/except` — log warning and skip cache on any Redis error

**SQL Queries (all async via SQLAlchemy):**

1. **total_customers**: `SELECT COUNT(*) FROM customers [WHERE owner_id = user.id for executive]`
2. **total_customers_change_pct**: compare count in last 30 days vs prior 30 days
3. **active_interactions**: `SELECT COUNT(*) FROM interactions WHERE occurred_at >= now() - 30 days`
4. **active_interactions_change_pct**: compare last 30 days vs prior 30 days
5. **at_risk_customers**: `SELECT COUNT(*) FROM customers WHERE status IN ('at_risk', 'churned')`
6. **ai_insights_generated**: `SELECT COUNT(*) FROM ai_insights WHERE status = 'success'`
7. **interaction_activity**: `SELECT DATE(occurred_at), COUNT(*) FROM interactions WHERE occurred_at >= now() - {range} GROUP BY DATE(occurred_at)`
8. **customer_health**: count by status bucket:
   - `healthy`: status = `'active'`
   - `stagnant`: status = `'prospect'` (or any non-active, non-churned)
   - `churn_risk`: status IN (`'at_risk'`, `'churned'`)

**Permission:** Reuses `require_permission("customer:view")` from existing deps.

---

## Frontend Design

### New Files
- `frontend/lib/api/dashboardApi.ts` — typed API service
- `frontend/app/(dashboard)/dashboard/page.tsx` — dashboard page (replace stub)
- `frontend/components/dashboard/StatCard.tsx` — individual metric card component
- `frontend/components/dashboard/InteractionActivityChart.tsx` — bar chart component
- `frontend/components/dashboard/CustomerHealthChart.tsx` — donut chart component
- `frontend/components/dashboard/DashboardSkeleton.tsx` — loading skeleton

### Modified Files
- `frontend/package.json` — add `recharts` and `@types/recharts` (if needed)

### Data Flow

```
DashboardPage (page.tsx)
  ├── useEffect → getDashboardAnalytics(range)
  ├── useState: { data, loading, error, range }
  ├── StatCard × 4
  ├── InteractionActivityChart (receives interaction_activity[])
  └── CustomerHealthChart (receives customer_health{})
```

Auth token is read from Redux store (`state.auth.token`) and passed via axios interceptor (already set up in the project).

### Component Details

**StatCard Props:**
```typescript
interface StatCardProps {
  icon: React.ReactNode
  iconBg: string          // Tailwind class e.g. "bg-teal-50"
  iconColor: string       // Tailwind class e.g. "text-teal-600"
  label: string
  value: number
  changePct: number       // positive or negative float
}
```

**InteractionActivityChart Props:**
```typescript
interface InteractionActivityChartProps {
  data: { date: string; count: number }[]
  range: '7d' | '30d'
  onRangeChange: (range: '7d' | '30d') => void
}
```
- Highest-count bar rendered in green (`#10b981`); others in dark teal (`#134e4a`)
- Day labels derived from `date` string (e.g. "Mon", "Tue" for 7d view)

**CustomerHealthChart Props:**
```typescript
interface CustomerHealthChartProps {
  healthy: number
  stagnant: number
  churnRisk: number
}
```
- Center label uses `recharts` custom label render function
- Healthy percentage: `Math.round(healthy / total * 100)`

### Styling Notes
- Matches existing project: Tailwind CSS v4, no component library needed beyond what's there
- White card backgrounds: `bg-white rounded-2xl shadow-sm border border-gray-100 p-6`
- Page background inherits from the dashboard layout (already light gray/blue)
- Stat card change badge: `text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium` (red variant for negative)
- Colors match the image: teal sidebar is already there, green highlights for charts

### Environment Variables

**Backend `.env` addition:**
```
REDIS_URL=redis://:<password>@<host>:<port>
```

**Frontend `.env` addition:** None needed (uses existing `NEXT_PUBLIC_API_URL`).
