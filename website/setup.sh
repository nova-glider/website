#!/usr/bin/env bash
set -e

IMAGE_NAME="all-in-one"

cd ..
./build-dashboard.sh
cd website

echo "📦 Building all-in-one Docker image..."
docker build -t $IMAGE_NAME .

echo "✅ All-in-one Docker image '$IMAGE_NAME' built successfully."
echo "You can run it using:"
echo "docker run -p 3000:3000 $IMAGE_NAME"