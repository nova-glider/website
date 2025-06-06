FROM node:20

# Set working directory
WORKDIR /app

# Copy source files and app.js
COPY package.json ./package.json
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY src/ ./src/

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Expose port defined by PORT env variable, default to 3000
ARG PORT=3000
ENV PORT=${PORT}
EXPOSE ${PORT}

# Start the app
CMD ["pnpm", "dev"]

# Build the Docker image with:
# docker build -t novacan-backend .