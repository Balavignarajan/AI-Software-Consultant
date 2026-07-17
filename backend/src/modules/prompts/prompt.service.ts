import type { AIRequest } from "../ai/ai.types.js";
import { promptBuilder, PromptBuilder } from "./prompt.builder.js";
import type { PromptType } from "./prompt.constants.js";
import type { BuiltPrompt, PromptBuildInput } from "./prompt.types.js";

export class PromptService {
  constructor(private readonly builder: PromptBuilder = promptBuilder) {}

  buildPrompt(input: PromptBuildInput): BuiltPrompt {
    this.assertPromptType(input.promptType);
    return this.builder.build(input);
  }

  buildAIRequest(input: PromptBuildInput): AIRequest {
    return this.buildPrompt(input).request;
  }

  private assertPromptType(promptType: PromptType): void {
    if (!promptType) {
      throw new Error("Prompt type is required");
    }
  }
}

export const promptService = new PromptService();
