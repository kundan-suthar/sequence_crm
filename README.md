# SequenceCRM

A full-stack CRM application with a **FastAPI** backend and a **Next.js** frontend, backed by **PostgreSQL** and **Redis**.

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend   | FastAPI, Python 3.12, SQLAlchemy 2 (async) |
| Database  | PostgreSQL 16                     |
| Cache     | Redis 7                           |
| Auth      | JWT (python-jose)                 |
| AI        | OpenAI API                        |

---

## Prerequisites

| Tool           | Minimum version | Install guide |
|----------------|-----------------|---------------|
| Docker         | 24+             | https://docs.docker.com/get-docker/ |
| Docker Compose | 2.20+           | Bundled with Docker Desktop |

> **Local development without Docker** additionally requires Node.js 20+, Python 3.12+, and [uv](https://docs.astral.sh/uv/).

---

## Quick Start (Docker)

### 1. Clone the repository

```bash
git clone <repository-url>
cd SequenceCRM
```

### 2. Create your environment file

```bash
cp .env.example .env
```

Open `.env` and at minimum update:

- `SECRET_KEY` — generate a secure value with `openssl rand -hex 32`
- `OPENAI_API_KEY` — your OpenAI API key (optional; leave blank to disable AI features)
- `POSTGRES_PASSWORD` — a strong database password

### 3. Build and start all services

```bash
docker compose up --build
```

This single command:
1. Starts a PostgreSQL database and Redis instance
2. Builds and starts the FastAPI backend (runs Alembic migrations automatically on startup)
3. Builds and starts the Next.js frontend

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:3000  |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc)   | http://localhost:8000/redoc |

### 4. Stop all services

```bash
docker compose down
```

To also remove persisted data volumes:

```bash
docker compose down -v
```

---

## Environment Variables Reference

Copy `.env.example` to `.env` and adjust as needed.

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_USER` | `sequence_user` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `sequence_pass` | PostgreSQL password |
| `POSTGRES_DB` | `sequence_crm` | PostgreSQL database name |
| `SECRET_KEY` | *(required)* | JWT signing secret — use a long random string in production |
| `OPENAI_API_KEY` | *(empty)* | OpenAI API key for AI insight features |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000/` | Backend URL accessible from the browser |
| `NEXT_PUBLIC_API_TIMEOUT` | `15000` | Axios request timeout in ms |
| `BACKEND_PORT` | `8000` | Host port mapped to the backend container |
| `FRONTEND_PORT` | `3000` | Host port mapped to the frontend container |

---

## Local Development (without Docker)

### Backend

```bash
cd backend

# Install uv if not already installed
pip install uv

# Create virtualenv and install dependencies
uv sync

# Copy and configure env
cp app/.env.example .env
# Edit .env with your local database and secrets

# Run database migrations
uv run alembic upgrade head

# Start the development server (auto-reload)
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure env
cp .env .env.local
# Edit .env.local if your backend runs on a different URL

# Start the development server (auto-reload)
npm run dev
```

---

## Database Migrations

Migrations are managed with **Alembic** and run automatically when the Docker backend container starts.

For manual migration management:

```bash
# Inside the backend directory (or via docker exec)
# Create a new migration
uv run alembic revision --autogenerate -m "describe your change"

# Apply all pending migrations
uv run alembic upgrade head

# Roll back one migration
uv run alembic downgrade -1
```

Via Docker:

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend alembic revision --autogenerate -m "my change"
```

---

## Seeding the Database

```bash
# Local
cd backend
uv run python -m app.db.seed

# Docker
docker compose exec backend python -m app.db.seed
```

---

## Project Structure

```
SequenceCRM/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/v1/           # Route handlers
│   │   ├── core/             # Config, security, middleware
│   │   ├── db/               # Database session & seed scripts
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Business logic (AI service, etc.)
│   │   └── main.py           # Application entry point
│   ├── alembic/              # Database migration scripts
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/                 # Next.js application
│   ├── app/                  # App router pages and layouts
│   ├── components/           # Reusable UI components
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml        # Orchestrates all services
├── .env.example              # Environment variable template
└── README.md
```

---

## Health Check

```bash
curl http://localhost:8000/health
# {"status":"ok"}
```
