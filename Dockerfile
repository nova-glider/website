# ---- Build stage ----
FROM node:20-alpine AS builder

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy lockfile + package.json first for better caching
COPY pnpm-lock.yaml package.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of your project
COPY . .

# Build and export static site
RUN pnpm build

# ---- Final stage (just holds the output) ----
FROM alpine AS export

WORKDIR /out

# Copy the export folder from the builder
COPY --from=builder /app/out ./
