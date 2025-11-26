# --- Homepage build ---
FROM node:20-slim AS homepage-builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY tailwind.config.js ./
RUN pnpm install
COPY src ./src

# --- Homepage runner ---
FROM node:20-slim AS homepage-runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY --from=homepage-builder /app /app
ENV PORT=3000
EXPOSE 3000

CMD ["pnpm", "dev"]