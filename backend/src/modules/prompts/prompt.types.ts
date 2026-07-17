import type { AIMessage, AIModel, AIRequest } from "../ai/ai.types.js";
import type { PromptType } from "./prompt.constants.js";

export type TemplateVariables = Record<string, string | number | boolean | null | undefined>;

export type OrganizationPromptContext = {
  id: string;
  name: string;
};

export type ConsultationPromptContext = {
  id: string;
  title: string;
  industry?: string | null;
  projectType?: string | null;
  budgetRange?: string | null;
  timeline?: string | null;
  status?: string | null;
};

export type ConversationPromptMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type PromptBuildInput = {
  promptType: PromptType;
  model: AIModel;
  userMessage: string;
  organization?: OrganizationPromptContext;
  consultation?: ConsultationPromptContext;
  conversationHistory?: ConversationPromptMessage[];
  variables?: TemplateVariables;
  maxTokens?: number;
  temperature?: number;
  metadata?: Record<string, unknown>;
};

export type BuiltPrompt = {
  systemPrompt: string;
  userPrompt: string;
  messages: AIMessage[];
  request: AIRequest;
};
