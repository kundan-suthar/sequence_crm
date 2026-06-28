# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package manifests
COPY package.json package-lock.json* ./

# Install production + dev dependencies (needed for build)
RUN npm ci

# ── Stage 2: Build the Next.js app ────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Bring in node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args passed through docker-compose for the public API URL
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/
ARG NEXT_PUBLIC_API_TIMEOUT=15000

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_TIMEOUT=$NEXT_PUBLIC_API_TIMEOUT

# Produce a standalone Next.js build for minimal runtime image size
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 3: Minimal runtime image ────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only what is needed to run the app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
