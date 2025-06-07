# Use multi-stage for smaller final image
FROM node:20-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable 
# && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy only package files first for better caching
COPY package.json pnpm-lock.yaml ./
COPY tailwind.config.js ./

# Install dependencies
RUN pnpm install

# Copy source files after dependencies
COPY src ./src

# --- Production image ---
FROM node:20-slim AS runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable 
# && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy installed dependencies and source from builder
COPY --from=builder /app /app

# Use a non-root user for security
# RUN useradd --user-group --create-home --shell /bin/false appuser
# USER appuser

ENV PORT=3000
EXPOSE 3000

CMD ["pnpm", "dev"]