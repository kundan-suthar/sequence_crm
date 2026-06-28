# Requirements: Dashboard Overview

## Overview
Implement the main dashboard page with real-time analytics data from the backend. The dashboard displays key CRM metrics with charts powered by Recharts on the frontend and a Redis-cached analytics API on the backend.

---

## Requirements

### REQ-1: Backend Dashboard Analytics API
**As an** authenticated user,
**I want** a `/dashboard/analytics` endpoint,
**So that** I can retrieve aggregated CRM metrics in a single request.

**Acceptance Criteria:**
- `GET /api/v1/dashboard/analytics` returns a JSON payload with:
  - `total_customers`: integer count of all customers (admin sees all; executive sees owned)
  - `total_customers_change_pct`: float percentage change vs. previous 30-day period
  - `active_interactions`: integer count of interactions in the last 30 days
  - `active_interactions_change_pct`: float percentage change vs. previous 30-day period
  - `at_risk_customers`: integer count of customers with status `"at_risk"` or `"churned"`
  - `at_risk_change_pct`: float percentage change vs. previous 30-day period
  - `ai_insights_generated`: integer count of AI insights with status `"success"`
  - `ai_insights_change_pct`: float percentage change vs. previous 30-day period
  - `interaction_activity`: list of `{ date: str (YYYY-MM-DD), count: int }` for the selected time range (7 or 30 days)
  - `customer_health`: object with `{ healthy: int, stagnant: int, churn_risk: int }` counts
- The endpoint accepts an optional query param `range` with values `"7d"` (default) or `"30d"` for the interaction activity time range
- Admin users see aggregate data across all customers; executive users see only their own

### REQ-2: Redis Cloud Caching
**As a** backend developer,
**I want** dashboard analytics responses cached in Redis Cloud,
**So that** repeated calls don't re-query the database on every request.

**Acceptance Criteria:**
- Redis connection uses the `REDIS_URL` environment variable (Redis Cloud connection string format: `redis://:<password>@<host>:<port>`)
- A `redis_client.py` module in `app/core/` initialises an async Redis client using `redis.asyncio`
- Dashboard analytics are cached with a TTL of 300 seconds (5 minutes)
- Cache key is scoped by user role and range param: `dashboard:analytics:{role}:{range}` where role is `admin` or `executive`
- On cache miss, the endpoint queries the database, serialises the result, stores it in Redis, then returns it
- On cache hit, the endpoint returns the cached value without hitting the database
- If Redis is unavailable (connection error), the endpoint falls back gracefully to the database query and logs a warning — it does NOT return a 500 error
- `redis-py` (`redis[asyncio]`) is added to `pyproject.toml` dependencies

### REQ-3: Dashboard Stat Cards
**As a** user viewing the dashboard,
**I want** four metric cards at the top of the dashboard,
**So that** I can see key CRM numbers at a glance.

**Acceptance Criteria:**
- Four cards displayed in a 4-column responsive grid:
  1. **Total Customers** — icon: Users group, teal icon background
  2. **Active Interactions** — icon: MessageSquare/chat, teal icon background
  3. **At-Risk Customers** — icon: AlertTriangle, red/warning icon background
  4. **AI Insights Generated** — icon: Zap/lightning, purple icon background
- Each card shows:
  - Icon in a rounded square background
  - Percentage change badge (green with ↑ for positive, red with ↓ for negative)
  - Label text (e.g. "Total Customers")
  - Large bold metric value (formatted with commas for thousands)
- Cards have a white background, rounded corners, and subtle shadow matching the design

### REQ-4: Interaction Activity Bar Chart
**As a** user viewing the dashboard,
**I want** a bar chart showing interaction volume over time,
**So that** I can identify activity trends.

**Acceptance Criteria:**
- Chart is rendered using `recharts` `BarChart` component
- X-axis displays day labels (Mon, Tue, Wed… for 7d; or date labels for 30d)
- Y-axis is hidden (no axis line or labels) to match the clean design
- Bars use a dark teal color (`#0f5454` or similar) by default; the bar with the highest value is highlighted in a bright green (`#10b981` or similar)
- A dropdown in the top-right of the card allows switching between "Last 7 Days" and "Last 30 Days" — triggers a new API call with the updated `range` param
- Chart has a white card background with `"Interaction Activity"` heading and rounded corners
- Chart is responsive (uses `ResponsiveContainer`)
- Tooltip shows the date and count on hover

### REQ-5: Customer Health Breakdown Donut Chart
**As a** user viewing the dashboard,
**I want** a donut chart showing the distribution of customer health statuses,
**So that** I can quickly assess the overall health of my customer base.

**Acceptance Criteria:**
- Chart is rendered using `recharts` `PieChart` with `innerRadius` to create a donut effect
- Three segments: Healthy (green `#10b981`), Stagnant (orange `#f97316`), Churn Risk (red `#ef4444`)
- Center of the donut displays the healthy percentage (e.g. `"70%"`) in large bold text with `"HEALTHY"` label beneath in small caps
- Below the chart, a legend lists all three categories with their color dot and count
- Card heading is `"Customer Health Breakdown"`
- Chart is responsive

### REQ-6: Dashboard Page Layout
**As a** user,
**I want** the dashboard to have a well-structured layout matching the provided design,
**So that** the page is visually consistent and easy to navigate.

**Acceptance Criteria:**
- Page header: `"Dashboard Overview"` h1 with subtitle `"Welcome back, {firstName}. Here's what's happening with your accounts today."`
- Top-right `"+ Log Interaction"` button (dark teal, links to `/dashboard/interactions/new` or opens the log interaction modal — use a link for now)
- Header row: title+subtitle on left, button on right, in `flex justify-between items-start`
- Stat cards grid below header (4 cols on desktop, 2 on tablet, 1 on mobile)
- Charts row below stat cards: Interaction Activity chart on the left (~60% width), Customer Health on the right (~40% width) — side by side on `md+`, stacked on mobile
- The page uses the existing dashboard layout (sidebar already handled) — no changes needed to layout files
- Page fetches data from the backend API using `axios` with the existing auth token from Redux store
- While loading, cards and charts show skeleton placeholders
- On API error, a subtle error message is shown instead of charts

### REQ-7: Frontend API Integration
**As a** developer,
**I want** a typed API service function for dashboard analytics,
**So that** data fetching is consistent with the rest of the frontend codebase.

**Acceptance Criteria:**
- A `dashboardApi.ts` (or similar) file in `frontend/lib/api/` exports a `getDashboardAnalytics(range: '7d' | '30d')` function using the existing `axios` instance
- TypeScript interfaces `DashboardAnalytics`, `InteractionActivityPoint`, `CustomerHealth` are defined and used throughout the dashboard components
- `recharts` package is added to `frontend/package.json` dependencies
