export type ChatMessageDto = {
  id: string;
  consultationId: string;
  organizationId: string;
  senderType: "user" | "assistant" | "system";
  message: string;
  metadata: Record<string, unknown> | null;
  createdBy: string | null;
  createdAt: Date;
};

export type ChatUsageDto = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type ChatResponseDto = {
  userMessage: ChatMessageDto;
  assistantMessage: ChatMessageDto;
  usage: ChatUsageDto;
  model: string;
};
