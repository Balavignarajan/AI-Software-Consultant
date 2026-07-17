export const AI_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
} as const;

export type AIRole = (typeof AI_ROLES)[keyof typeof AI_ROLES];

export const AI_PROVIDERS = {
  OPENAI: "OPENAI",
  ANTHROPIC: "ANTHROPIC",
  GEMINI: "GEMINI",
  LOCAL: "LOCAL",
} as const;

export type AIProviderName =
  (typeof AI_PROVIDERS)[keyof typeof AI_PROVIDERS];
