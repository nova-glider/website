#!/usr/bin/env bash

IMAGE_NAME="nextjs-static-export"
CONTAINER_NAME="nextjs-export-tmp"
DASHBOARD_BRANCH="main"

set -e

# check if Docker and git are installed
if ! command -v docker &> /dev/null
then
    echo "Docker is not installed. Please install Docker to proceed."
    exit 1
fi
if ! command -v git &> /dev/null
then
    echo "Git is not installed. Please install Git to proceed."
    exit 1
fi

rm -rf dashboard
echo "📥 Cloning dashboard repository..."
git clone --branch $DASHBOARD_BRANCH https://github.com/nova-glider/dashboard
cd dashboard

echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME .

echo "🐳 Creating temporary container..."
docker create --name $CONTAINER_NAME $IMAGE_NAME >/dev/null
cd ..
# Remove existing ./out if it exists
if [ -d "./website/src/pages/out" ]; then
    echo "🧹 Removing existing ./out directory..."
    rm -rf ./website/src/pages/out
fi

echo "📁 Copying export folder from container..."
docker cp $CONTAINER_NAME:/out ./website/src/pages/out
echo "🗑️ Cleaning up..."
docker rm $CONTAINER_NAME >/dev/null
rm -rf dashboard

echo "✅ Done! Static export is available in ./website/src/pages/out"