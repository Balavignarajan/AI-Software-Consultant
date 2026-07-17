import type { AIProviderName, AIRole } from "./ai.constants.js";

export type AIModel = {
  provider: AIProviderName;
  name: string;
  maxTokens?: number;
  temperature?: number;
};

export type AIMessage = {
  role: AIRole;
  content: string;
  name?: string;
};

export type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type GenerationMetadata = {
  provider: AIProviderName;
  model: string;
  finishReason?: string;
  latencyMs?: number;
  requestId?: string;
};

export type AIRequest = {
  model: AIModel;
  messages: AIMessage[];
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  metadata?: Record<string, unknown>;
};

export type AIResponse = {
  message: AIMessage;
  usage: TokenUsage;
  metadata: GenerationMetadata;
};

export interface AIProvider {
  readonly name: AIProviderName;
  generateResponse(request: AIRequest): Promise<AIResponse>;
}
