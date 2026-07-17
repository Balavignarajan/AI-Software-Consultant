import { pgEnum } from "drizzle-orm/pg-core";

export const verificationTokenTypeEnum = pgEnum("verification_token_type", [
  "EMAIL_VERIFY",
  "PASSWORD_RESET",
  "INVITATION",
]);

export const messageSenderTypeEnum = pgEnum("message_sender_type", [
  "user",
  "assistant",
  "system",
]);

export const aiGenerationStatusEnum = pgEnum("ai_generation_status", [
  "success",
  "failed",
]);
