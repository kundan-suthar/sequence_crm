# ── Stage 1: Build / dependency install ──────────────────────────────────────
FROM python:3.12-slim AS builder

# Install uv (fast package manager used by this project)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY pyproject.toml uv.lock ./

# Install dependencies into a virtualenv inside the image
RUN uv sync --frozen --no-dev

# ── Stage 2: Runtime image ────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

WORKDIR /app

# Copy the virtualenv produced by the builder stage
COPY --from=builder /app/.venv /app/.venv

# Make the venv the active Python environment
ENV PATH="/app/.venv/bin:$PATH"

# Copy application source
COPY . .

# Ensure logs directory exists
RUN mkdir -p /app/logs

EXPOSE 8000

# Run database migrations then start the server
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
