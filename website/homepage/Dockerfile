FROM node:20

# Set working directory
WORKDIR /app

# Copy source files and app.js
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY tailwind.config.js ./tailwind.config.js
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
# docker build -t novacan-site .

# DO NOT USE VOLUMES, THEY DONT WORK YET!
# Link src/data with the host (mount as volume at runtime)
# To mount src/data as a volume from the host, use the following in your docker-compose.yml:
# This isnt required if you want to use the default data.
# 
#   volumes:
#     - ./src/data:/app/src/data

#   Example docker-compose service:
#   services:
#     app:
#       image: novacan-site
#       ports:
#         - "3000:3000"
#       volumes:
#         - ./src/data:/app/src/data