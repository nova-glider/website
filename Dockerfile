# --- Backend build ---
FROM node:20-slim AS backend-builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /backend

COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install
COPY backend/src ./src

# --- Homepage build ---
FROM node:20-slim AS homepage-builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /homepage

COPY homepage/package.json homepage/pnpm-lock.yaml ./
COPY homepage/tailwind.config.js ./
RUN pnpm install
COPY homepage/src ./src

# --- Backend runner ---
FROM node:20-slim AS backend-runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /backend

COPY --from=backend-builder /backend /backend

# Create db directory and set permissions before switching user
RUN mkdir -p /backend/db && \
	useradd --user-group --create-home --shell /bin/false appuser && \
	chown -R appuser:appuser /backend

USER appuser

ENV PORT=3001
EXPOSE 3001

CMD ["pnpm", "dev"]

# --- Homepage runner ---
FROM node:20-slim AS homepage-runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /homepage

COPY --from=homepage-builder /homepage /homepage

ENV PORT=3000
EXPOSE 3000

CMD ["pnpm", "dev"]