// HyperDoc AI Orchestrator - Core Intelligence Engine
// Powered by GlacierEQ AI Foundation with 500+ Repository Integration

import { EventEmitter } from 'events';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import { logger } from '../utils/logger';

export interface AIProvider {
  name: string;
  client: any;
  models: string[];
  priority: number;
  healthy: boolean;
  metrics: ProviderMetrics;
}

export interface ProviderMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  lastRequest: Date;
  costPerToken: number;
}

export interface ProcessingRequest {
  id?: string;
  type: 'text' | 'code' | 'math' | 'document' | 'legal' | 'evidence';
  content: string;
  context?: any;
  requirements?: {
    quality: number;
    speed: number;
    cost: number;
  };
  tools?: string[];
}

export interface ProcessingResult {
  id: string;
  result: any;
  provider: string;
  processingTime: number;
  quality: number;
  cost: number;
  metadata?: any;
}

export class HyperDocAIOrchestrator extends EventEmitter {
  private providers: Map<string, AIProvider> = new Map();
  private isInitialized = false;
  private healthCheckInterval: NodeJS.Timeout;

  constructor(private config: any) {
    super();
  }

  async initialize(): Promise<void> {
    logger.info('🧮 Initializing HyperDoc AI Orchestrator with GlacierEQ Foundation...');
    
    // Initialize all AI providers from your arsenal
    await this.initializeProviders();
    
    // Start health monitoring
    this.startHealthMonitoring();
    
    this.isInitialized = true;
    this.emit('orchestrator:ready');
    
    logger.info('✅ AI Orchestrator initialized with GlacierEQ integration');
  }

  private async initializeProviders(): Promise<void> {
    const providers = this.config.providers;

    // OpenAI Provider (Primary)
    if (providers.openai?.apiKey) {
      const openai = new OpenAI({
        apiKey: providers.openai.apiKey
      });
      
      this.providers.set('openai', {
        name: 'openai',
        client: openai,
        models: providers.openai.models,
        priority: providers.openai.priority,
        healthy: true,
        metrics: this.initializeMetrics()
      });
      logger.info('✅ OpenAI provider initialized');
    }

    // DeepSeek Provider (Math & Code Specialist)
    if (providers.deepseek?.apiKey) {
      const deepseekClient = {
        apiKey: providers.deepseek.apiKey,
        baseURL: providers.deepseek.endpoint,
        async chat(params: any) {
          const response = await axios.post(`${this.baseURL}/chat/completions`, {
            model: params.model || 'deepseek-chat',
            messages: params.messages,
            temperature: params.temperature || 0.7,
            max_tokens: params.max_tokens || 2000
          }, {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          });
          return response.data;
        }
      };
      
      this.providers.set('deepseek', {
        name: 'deepseek',
        client: deepseekClient,
        models: providers.deepseek.models,
        priority: providers.deepseek.priority,
        healthy: true,
        metrics: this.initializeMetrics()
      });
      logger.info('✅ DeepSeek provider initialized');
    }

    // Anthropic/Claude Provider (Complex Reasoning)
    if (providers.anthropic?.apiKey) {
      const anthropic = new Anthropic({
        apiKey: providers.anthropic.apiKey
      });
      
      this.providers.set('anthropic', {
        name: 'anthropic',
        client: anthropic,
        models: providers.anthropic.models,
        priority: providers.anthropic.priority,
        healthy: true,
        metrics: this.initializeMetrics()
      });
      logger.info('✅ Anthropic provider initialized');
    }

    // Gemini Provider
    if (providers.gemini?.apiKey) {
      const geminiClient = {
        apiKey: providers.gemini.apiKey,
        async generateContent(params: any) {
          const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${this.apiKey}`, {
            contents: [{ parts: [{ text: params.prompt }] }]
          });
          return response.data;
        }
      };
      
      this.providers.set('gemini', {
        name: 'gemini',
        client: geminiClient,
        models: providers.gemini.models,
        priority: providers.gemini.priority,
        healthy: true,
        metrics: this.initializeMetrics()
      });
      logger.info('✅ Gemini provider initialized');
    }

    // Local AI Provider (AnythingLLM integration)
    if (providers.local?.endpoint) {
      const localClient = {
        endpoint: providers.local.endpoint,
        apiKey: providers.local.apiKey,
        async chat(params: any) {
          const response = await axios.post(`${this.endpoint}/v1/workspace/${params.workspace}/chat`, {
            message: params.message,
            mode: 'chat'
          }, {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          });
          return response.data;
        }
      };
      
      this.providers.set('local', {
        name: 'local',
        client: localClient,
        models: providers.local.models,
        priority: providers.local.priority,
        healthy: true,
        metrics: this.initializeMetrics()
      });
      logger.info('✅ Local AI provider initialized');
    }

    logger.info(`✨ Initialized ${this.providers.size} AI providers from GlacierEQ arsenal`);
  }

  async processIntelligentRequest(request: ProcessingRequest): Promise<ProcessingResult> {
    if (!this.isInitialized) {
      throw new Error('Orchestrator not initialized');
    }

    const startTime = Date.now();
    const requestId = request.id || this.generateRequestId();

    try {
      // Select optimal provider based on request type and requirements
      const provider = await this.selectOptimalProvider(request);
      
      logger.info(`🎯 Selected ${provider.name} for ${request.type} request`);
      
      // Process with selected provider
      const result = await this.processWithProvider(provider, request);
      
      // Update metrics
      const processingTime = Date.now() - startTime;
      await this.updateProviderMetrics(provider, processingTime, true);
      
      return {
        id: requestId,
        result,
        provider: provider.name,
        processingTime,
        quality: 0.95, // TODO: Implement quality assessment
        cost: this.calculateCost(provider, result)
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error(`Processing error for request ${requestId}:`, error);
      
      // Try fallback provider
      return await this.tryFallbackProvider(request, requestId);
    }
  }

  private async selectOptimalProvider(request: ProcessingRequest): Promise<AIProvider> {
    const availableProviders = Array.from(this.providers.values())
      .filter(p => p.healthy)
      .sort((a, b) => b.priority - a.priority);

    if (availableProviders.length === 0) {
      throw new Error('No healthy providers available');
    }

    // Intelligent provider selection based on request type
    switch (request.type) {
      case 'math':
        return this.providers.get('deepseek') || availableProviders[0];
      case 'legal':
        return this.providers.get('anthropic') || availableProviders[0];
      case 'code':
        return this.providers.get('deepseek') || availableProviders[0];
      case 'document':
        return this.providers.get('openai') || availableProviders[0];
      default:
        return availableProviders[0];
    }
  }

  private async processWithProvider(provider: AIProvider, request: ProcessingRequest): Promise<any> {
    const maxRetries = 3;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`🔄 Processing with ${provider.name} (attempt ${attempt}/${maxRetries})`);
        
        let result;
        
        if (provider.name === 'openai') {
          const response = await provider.client.chat.completions.create({
            model: provider.models[0],
            messages: [{ role: 'user', content: request.content }],
            temperature: 0.7,
            max_tokens: 2000
          });
          result = response.choices[0].message.content;
        } 
        else if (provider.name === 'deepseek') {
          const response = await provider.client.chat({
            messages: [{ role: 'user', content: request.content }]
          });
          result = response.choices[0].message.content;
        }
        else if (provider.name === 'anthropic') {
          const response = await provider.client.messages.create({
            model: provider.models[0],
            max_tokens: 2000,
            messages: [{ role: 'user', content: request.content }]
          });
          result = response.content[0].text;
        }
        else if (provider.name === 'gemini') {
          const response = await provider.client.generateContent({
            model: provider.models[0],
            prompt: request.content
          });
          result = response.candidates[0].content.parts[0].text;
        }
        else if (provider.name === 'local') {
          const response = await provider.client.chat({
            workspace: 'default',
            message: request.content
          });
          result = response.textResponse;
        }
        
        logger.info(`✅ Successfully processed with ${provider.name}`);
        return result;

      } catch (error) {
        lastError = error as Error;
        logger.error(`❌ Attempt ${attempt} failed with ${provider.name}:`, error.message);
        
        if (attempt < maxRetries) {
          const backoffTime = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
    }

    throw new Error(`All retry attempts failed. Last error: ${lastError.message}`);
  }

  private async tryFallbackProvider(request: ProcessingRequest, requestId: string): Promise<ProcessingResult> {
    const fallbackProviders = Array.from(this.providers.values())
      .filter(p => p.healthy)
      .sort((a, b) => a.priority - b.priority); // Lower priority as fallback

    for (const provider of fallbackProviders) {
      try {
        const result = await this.processWithProvider(provider, request);
        const processingTime = Date.now();
        
        return {
          id: requestId,
          result,
          provider: `${provider.name}-fallback`,
          processingTime,
          quality: 0.8, // Lower quality for fallback
          cost: this.calculateCost(provider, result)
        };
      } catch (error) {
        logger.warn(`Fallback provider ${provider.name} also failed:`, error.message);
      }
    }

    throw new Error('All providers failed, including fallbacks');
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      for (const [name, provider] of this.providers) {
        try {
          await this.checkProviderHealth(provider);
        } catch (error) {
          logger.error(`Health check failed for ${name}:`, error);
          provider.healthy = false;
        }
      }
    }, 30000); // Check every 30 seconds
  }

  private async checkProviderHealth(provider: AIProvider): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Simple health check request
      if (provider.name === 'openai') {
        await provider.client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'health check' }],
          max_tokens: 1
        });
      } else {
        // Generic health check for other providers
        // Implementation varies by provider
      }
      
      provider.healthy = true;
      provider.metrics.averageResponseTime = Date.now() - startTime;
      
    } catch (error) {
      provider.healthy = false;
      provider.metrics.errorRate += 1;
      throw error;
    }
  }

  private initializeMetrics(): ProviderMetrics {
    return {
      requestCount: 0,
      averageResponseTime: 0,
      errorRate: 0,
      lastRequest: new Date(),
      costPerToken: 0.001 // Default cost
    };
  }

  private async updateProviderMetrics(provider: AIProvider, processingTime: number, success: boolean): Promise<void> {
    provider.metrics.requestCount += 1;
    provider.metrics.lastRequest = new Date();
    
    if (success) {
      // Update running average
      provider.metrics.averageResponseTime = 
        (provider.metrics.averageResponseTime + processingTime) / 2;
    } else {
      provider.metrics.errorRate += 1;
    }
  }

  private calculateCost(provider: AIProvider, result: any): number {
    // Rough token estimation and cost calculation
    const estimatedTokens = JSON.stringify(result).length / 4;
    return estimatedTokens * provider.metrics.costPerToken;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getProviders(): Record<string, any> {
    const providerInfo = {};
    for (const [name, provider] of this.providers) {
      providerInfo[name] = {
        healthy: provider.healthy,
        models: provider.models,
        priority: provider.priority,
        metrics: provider.metrics
      };
    }
    return providerInfo;
  }

  async getProviderStatus(): Promise<any[]> {
    return Array.from(this.providers.entries()).map(([name, provider]) => ({
      name,
      healthy: provider.healthy,
      models: provider.models,
      priority: provider.priority,
      responseTime: provider.metrics.averageResponseTime,
      errorRate: provider.metrics.errorRate,
      requestCount: provider.metrics.requestCount,
      lastRequest: provider.metrics.lastRequest
    }));
  }

  async shutdown(): Promise<void> {
    logger.info('🛁 Shutting down AI Orchestrator...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.removeAllListeners();
    
    logger.info('✅ AI Orchestrator shutdown complete');
  }
}