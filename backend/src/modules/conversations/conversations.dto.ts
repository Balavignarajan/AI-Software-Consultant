export type ConversationMessageDto = {
  id: string;
  consultationId: string;
  organizationId: string;
  senderType: "user" | "assistant" | "system";
  message: string;
  metadata: Record<string, unknown> | null;
  createdBy: string | null;
  createdAt: Date;
};
