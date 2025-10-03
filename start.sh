#!/bin/bash

# POPIS Hackathon Boilerplate - Quick Start Script
# This script helps you get started quickly with the development environment

set -e

echo "🚀 POPIS Hackathon Boilerplate - Quick Start"
echo "=============================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env from example..."
    cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env.local ]; then
    echo "📝 Creating frontend/.env.local from example..."
    cp frontend/.env.example frontend/.env.local
fi

echo ""
echo "🐳 Starting Docker containers..."
echo ""

# Start Docker Compose
docker-compose up --build

# This will keep running until you press Ctrl+C
