import type { AIProvider, AIRequest, AIResponse } from "./ai.types.js";

export class AIService {
  constructor(private readonly provider: AIProvider) {}

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    return this.provider.generateResponse(request);
  }

  getProviderName(): string {
    return this.provider.name;
  }
}
