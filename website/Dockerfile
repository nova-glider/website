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