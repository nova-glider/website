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
# Option 1: Export build artifacts to host (not directly possible with Dockerfile alone)
# You can use 'docker cp' after building the image and running a container:
# docker build -t my-app .
# docker create --name temp-container my-app
# docker cp temp-container:/app/.next/standalone ./standalone
# docker rm temp-container

# Option 2: Run the app directly in the final image (recommended for deployment)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built app from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
