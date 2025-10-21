// HyperDoc AI Orchestrator - Main Entry Point
// Built on GlacierEQ AI Foundation with 500+ Repository Integration

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { HyperDocAIOrchestrator } from './core/orchestrator';
import { MemoryFederation } from './memory/federation';
import { MCPBridge } from './mcp/bridge';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

class HyperDocAIServer {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private orchestrator: HyperDocAIOrchestrator;
  private memoryFederation: MemoryFederation;
  private mcpBridge: MCPBridge;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
  }

  async initialize(): Promise<void> {
    logger.info('🚀 Initializing HyperDoc AI Powerhouse with GlacierEQ Foundation...');
    
    // Initialize core components with your API arsenal
    await this.initializeOrchestrator();
    await this.initializeMemoryFederation();
    await this.initializeMCPBridge();
    
    // Setup Express middleware
    this.setupMiddleware();
    
    // Setup routes
    this.setupRoutes();
    
    // Setup WebSocket handlers
    this.setupWebSocketHandlers();
    
    logger.info('✅ HyperDoc AI Server initialization complete');
  }

  private async initializeOrchestrator(): Promise<void> {
    const config = {
      providers: {
        openai: {
          apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_ADMIN_KEY,
          models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
          priority: 95
        },
        deepseek: {
          apiKey: process.env.DEEPSEEK_API_KEY,
          endpoint: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
          models: ['deepseek-chat', 'deepseek-coder'],
          priority: 90
        },
        anthropic: {
          apiKey: process.env.ANTHROPIC_API_KEY,
          models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
          priority: 92
        },
        gemini: {
          apiKey: process.env.GEMINI_API_KEY,
          models: ['gemini-1.5-pro', 'gemini-1.5-flash'],
          priority: 88
        },
        groq: {
          apiKey: process.env.GROQ_API_KEY,
          models: ['llama-3.2-90b-text-preview', 'mixtral-8x7b-32768'],
          priority: 85
        },
        together: {
          apiKey: process.env.TOGETHER_AI_API_KEY,
          models: ['meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo'],
          priority: 83
        },
        local: {
          endpoint: process.env.ANYTHING_LLM_URL || 'http://localhost:3001/api',
          apiKey: process.env.ANYTHING_LLM_KEY,
          models: ['llama3.2', 'qwen2.5'],
          priority: 80
        }
      },
      memory: {
        supermemory: {
          apiKey: process.env.SUPERMEMORY_KEY,
          enabled: true,
          primary: true
        },
        mem0: {
          apiKey: process.env.MEM0_API_KEY,
          orgId: process.env.MEM0_ORG_ID,
          enabled: true
        }
      },
      mcp: {
        notion: {
          apiKey: process.env.NOTION_API_KEY,
          workspaceId: process.env.NOTION_WORKSPACE_ID
        },
        github: {
          token: process.env.GITHUB_TOKEN
        }
      }
    };

    this.orchestrator = new HyperDocAIOrchestrator(config);
    await this.orchestrator.initialize();
  }

  private async initializeMemoryFederation(): Promise<void> {
    this.memoryFederation = new MemoryFederation({
      providers: ['supermemory', 'mem0', 'memoryos'],
      primaryProvider: 'supermemory'
    });
    await this.memoryFederation.initialize();
  }

  private async initializeMCPBridge(): Promise<void> {
    this.mcpBridge = new MCPBridge({
      servers: ['notion', 'github'],
      tools: ['search', 'create', 'update', 'analyze']
    });
    await this.mcpBridge.initialize();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // AI processing endpoint
    this.app.post('/ai/process', async (req, res) => {
      try {
        const result = await this.orchestrator.processIntelligentRequest(req.body);
        res.json(result);
      } catch (error) {
        logger.error('Processing error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Memory operations
    this.app.post('/memory/store', async (req, res) => {
      try {
        await this.memoryFederation.store(req.body.key, req.body.data);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // MCP tool execution
    this.app.post('/mcp/execute', async (req, res) => {
      try {
        const result = await this.mcpBridge.executeTool(req.body.tool, req.body.params);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Provider status
    this.app.get('/providers/status', async (req, res) => {
      const status = await this.orchestrator.getProviderStatus();
      res.json(status);
    });
  }

  private setupWebSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('ai:request', async (data) => {
        try {
          const result = await this.orchestrator.processIntelligentRequest(data);
          socket.emit('ai:response', result);
        } catch (error) {
          socket.emit('ai:error', { error: error.message });
        }
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  async start(): Promise<void> {
    const port = process.env.PORT || 8000;
    
    this.server.listen(port, () => {
      logger.info(`🚀 HyperDoc AI Orchestrator running on port ${port}`);
      logger.info(`🌌 GlacierEQ AI Foundation: ACTIVE`);
      logger.info(`🧮 AI Providers: ${Object.keys(this.orchestrator.getProviders()).length}`);
      logger.info(`🧠 Memory Systems: ${this.memoryFederation.getProviderCount()}`);
      logger.info(`🔗 MCP Tools: ${this.mcpBridge.getToolCount()}`);
    });
  }

  async shutdown(): Promise<void> {
    logger.info('🛁 Shutting down HyperDoc AI Server...');
    
    if (this.orchestrator) {
      await this.orchestrator.shutdown();
    }
    
    if (this.server) {
      this.server.close();
    }
    
    logger.info('✅ HyperDoc AI Server shutdown complete');
  }
}

// Initialize and start server
const server = new HyperDocAIServer();

process.on('SIGINT', async () => {
  await server.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await server.shutdown();
  process.exit(0);
});

// Start the powerhouse
server.initialize().then(() => {
  server.start();
}).catch((error) => {
  logger.error('Failed to start HyperDoc AI Server:', error);
  process.exit(1);
});