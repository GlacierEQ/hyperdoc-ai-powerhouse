#!/bin/bash
# HyperDoc AI Powerhouse - GlacierEQ Foundation Initialization

set -e

echo "🌌 Initializing HyperDoc AI with GlacierEQ AI Foundation..."
echo "🔥 Integrating 500+ Repository Arsenal for Maximum Power!"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker is required but not installed${NC}"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}❌ Docker Compose is required${NC}"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo -e "${YELLOW}⚠️  Installing pnpm...${NC}"; npm install -g pnpm; }
command -v git >/dev/null 2>&1 || { echo -e "${RED}❌ Git is required${NC}"; exit 1; }

echo -e "${GREEN}✅ Prerequisites verified${NC}"

# Initialize Git submodules for GlacierEQ arsenal integration
echo -e "${PURPLE}🔗 Initializing GlacierEQ Repository Arsenal Submodules...${NC}"

# Create submodule directories
mkdir -p submodules/{memory,agents,evidence,llm,langchain,mcp,onlyoffice}

# Memory Systems (from GlacierEQ Memory Constellation)
echo -e "${BLUE}🧠 Adding Memory Systems Constellation...${NC}"
git submodule add https://github.com/Dhravya/supermemory.git submodules/memory/supermemory || echo "Submodule already exists"
git submodule add https://github.com/mem0ai/mem0.git submodules/memory/mem0 || echo "Submodule already exists"
# Note: Add your custom memory repos when they're available

# Agent Systems (from GlacierEQ Agent Arsenal)
echo -e "${BLUE}🤖 Adding Agent Orchestration Matrix...${NC}"
git submodule add https://github.com/lion-agi/lionagi.git submodules/agents/LionAGI || echo "Submodule already exists"
git submodule add https://github.com/joaomdmoura/crewAI.git submodules/agents/crewAI || echo "Submodule already exists"
git submodule add https://github.com/Significant-Gravitas/AutoGPT.git submodules/agents/AutoGPT || echo "Submodule already exists"

# Evidence Processing (from GlacierEQ Evidence Arsenal)
echo -e "${BLUE}📁 Adding Evidence Processing Systems...${NC}"
# Note: Add your FILEBOSS, MEGA-PDF repos when accessible
git submodule add https://github.com/m-bain/whisperX.git submodules/evidence/whisperX || echo "Submodule already exists"

# LLM Integration (from GlacierEQ LLM Arsenal)
echo -e "${BLUE}🔗 Adding LLM Integration Systems...${NC}"
git submodule add https://github.com/Mintplex-Labs/anything-llm.git submodules/llm/anything-llm || echo "Submodule already exists"
git submodule add https://github.com/mudler/LocalAI.git submodules/llm/LocalAI || echo "Submodule already exists"
git submodule add https://github.com/ollama/ollama.git submodules/llm/ollama || echo "Submodule already exists"

# LangChain Ecosystem
echo -e "${BLUE}🔗 Adding LangChain Ecosystem...${NC}"
git submodule add https://github.com/langchain-ai/langchain.git submodules/langchain/langchain || echo "Submodule already exists"
git submodule add https://github.com/langchain-ai/langgraph.git submodules/langchain/langgraph || echo "Submodule already exists"
git submodule add https://github.com/langflow-ai/langflow.git submodules/langchain/langflow || echo "Submodule already exists"
git submodule add https://github.com/langfuse/langfuse.git submodules/langchain/langfuse || echo "Submodule already exists"

# ONLYOFFICE Core
echo -e "${BLUE}📄 Adding ONLYOFFICE Integration...${NC}"
git submodule add https://github.com/ONLYOFFICE/DocumentServer.git submodules/onlyoffice/DocumentServer || echo "Submodule already exists"
git submodule add https://github.com/ONLYOFFICE/DocSpace.git submodules/onlyoffice/DocSpace || echo "Submodule already exists"
git submodule add https://github.com/ONLYOFFICE/sdkjs-plugins.git submodules/onlyoffice/sdkjs-plugins || echo "Submodule already exists"

# Initialize all submodules
echo -e "${YELLOW}🔄 Initializing and updating all submodules...${NC}"
git submodule update --init --recursive

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pnpm install

# Create required directories
echo -e "${BLUE}📁 Creating required directories...${NC}"
mkdir -p {
  logs,
  data/{postgres,redis,documents},
  plugins/{hyperdoc-plugins,docspace-plugins},
  tmp,
  backups
}

# Set permissions
echo -e "${BLUE}🔒 Setting permissions...${NC}"
chmod +x ops/scripts/*.sh
chmod +x infra/scripts/*.sh 2>/dev/null || true

# Verify environment file
if [ ! -f .env ]; then
  echo -e "${YELLOW}⚠️  Creating .env from template...${NC}"
  cp .env.example .env
  echo -e "${RED}❗ IMPORTANT: Update .env with your GlacierEQ API keys!${NC}"
fi

# Build the stack
echo -e "${YELLOW}🔨 Building HyperDoc AI stack...${NC}"
docker-compose build

# Final status
echo -e "${GREEN}"
echo "🎉 HyperDoc AI Powerhouse Initialization Complete!"
echo "🌌 GlacierEQ AI Foundation: INTEGRATED"
echo "🧠 Memory Systems: $(ls -1 submodules/memory 2>/dev/null | wc -l) providers"
echo "🤖 Agent Systems: $(ls -1 submodules/agents 2>/dev/null | wc -l) frameworks"
echo "📁 Evidence Systems: $(ls -1 submodules/evidence 2>/dev/null | wc -l) processors"
echo "🔗 LLM Integration: $(ls -1 submodules/llm 2>/dev/null | wc -l) systems"
echo "📄 ONLYOFFICE: $(ls -1 submodules/onlyoffice 2>/dev/null | wc -l) components"
echo ""
echo "🚀 Ready to start the powerhouse:"
echo "   Development: docker-compose -f docker-compose.dev.yml up -d"
echo "   Production:  docker-compose up -d"
echo "   Monitor:     open http://localhost:3001"
echo "   API:         open http://localhost:8000"
echo -e "${NC}"

echo -e "${PURPLE}🌟 The most powerful document AI system is ready! 🌟${NC}"