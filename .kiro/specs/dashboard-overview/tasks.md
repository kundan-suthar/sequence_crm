# Tasks: Dashboard Overview

## Task List

- [ ] 1. Backend: Redis client setup
  - [ ] 1.1 Add `redis[asyncio]>=5.0.0` to `backend/pyproject.toml` dependencies
  - [ ] 1.2 Add `REDIS_URL` to `backend/app/core/config.py` Settings class with a default of `""`
  - [ ] 1.3 Create `backend/app/core/redis_client.py` with an async Redis client initialised from `settings.REDIS_URL`; expose `get_redis()` returning the client or `None` if URL is empty
  - [ ] 1.4 Append `REDIS_URL=redis://:<password>@<host>:<port>` as a placeholder line to `backend/.env`

- [ ] 2. Backend: Dashboard schemas
  - [ ] 2.1 Create `backend/app/schemas/dashboard.py` with Pydantic models: `InteractionActivityPoint`, `CustomerHealthOut`, `DashboardAnalyticsOut`

- [ ] 3. Backend: Dashboard analytics endpoint
  - [ ] 3.1 Create `backend/app/api/v1/dashboard.py` with `GET /analytics` endpoint
  - [ ] 3.2 Implement all database queries: total customers, active interactions (last 30d), at-risk customers, AI insights count, interaction_activity grouped by day, customer health buckets
  - [ ] 3.3 Implement percentage change calculation helper comparing current vs previous period
  - [ ] 3.4 Implement Redis caching logic: try cache read → DB query on miss → cache write with 300s TTL; graceful fallback on Redis errors
  - [ ] 3.5 Register the dashboard router in `backend/app/main.py`

- [ ] 4. Frontend: Install recharts
  - [ ] 4.1 Install `recharts` package by adding it to `frontend/package.json` and running `npm install` in the frontend directory

- [ ] 5. Frontend: API service
  - [ ] 5.1 Create `frontend/lib/api/dashboardApi.ts` with TypeScript interfaces (`DashboardAnalytics`, `InteractionActivityPoint`, `CustomerHealth`) and `getDashboardAnalytics(range)` function using the existing axios instance

- [ ] 6. Frontend: StatCard component
  - [ ] 6.1 Create `frontend/components/dashboard/StatCard.tsx` matching the design: icon in colored rounded square, percentage change badge (green/red), label, and large bold value

- [ ] 7. Frontend: InteractionActivityChart component
  - [ ] 7.1 Create `frontend/components/dashboard/InteractionActivityChart.tsx` using Recharts `BarChart` with dark teal bars, highest bar highlighted green, "Last 7 Days / Last 30 Days" dropdown, responsive container, and hover tooltip

- [ ] 8. Frontend: CustomerHealthChart component
  - [ ] 8.1 Create `frontend/components/dashboard/CustomerHealthChart.tsx` using Recharts `PieChart` donut with three colored segments, center percentage label, and legend with counts

- [ ] 9. Frontend: Dashboard page
  - [ ] 9.1 Replace the stub in `frontend/app/(dashboard)/dashboard/page.tsx` with the full dashboard: header with title, subtitle (user first name from Redux), "+ Log Interaction" button, 4-column stat card grid (fetching from API), side-by-side chart row; include loading skeleton and error state
