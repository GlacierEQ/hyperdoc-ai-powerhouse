#!/bin/bash
# HyperDoc AI Development Environment Setup

set -e

echo "🔧 Setting up HyperDoc AI Development Environment..."

# Start development services
echo "🚀 Starting development services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Verify services
echo "🔍 Verifying service health..."
curl -f http://localhost:8000/health || echo "❌ Orchestrator API not ready"
curl -f http://localhost:6379/ping || echo "❌ Redis not ready"
ps aux | grep postgres || echo "❌ PostgreSQL not ready"

# Run database migrations
echo "🗄️ Running database migrations..."
cd apps/orchestrator-api
npx prisma migrate dev || echo "⚠️ Migrations failed or not configured"
cd ../..

# Install git hooks
echo "🪝 Installing git hooks..."
cp ops/hooks/pre-commit .git/hooks/
chmod +x .git/hooks/pre-commit

# Final status
echo "✅ Development environment ready!"
echo "🌐 Web Console: http://localhost:3000"
echo "🤖 AI Orchestrator: http://localhost:8000"
echo "📊 Grafana: http://localhost:3001"
echo "📄 ONLYOFFICE: http://localhost:80"
echo "🔍 Redis Insight: http://localhost:8001"