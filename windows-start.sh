#!/bin/bash

# POPIS - Quick Start for 24h Hackathon
set -e

echo "🚀 Starting POPIS Hackathon Boilerplate..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"
echo "🐳 Starting containers..."
echo ""

# Use docker compose if available, fallback to docker-compose
if command -v docker compose &> /dev/null; then
    docker compose up
else
    docker-compose up
fi
