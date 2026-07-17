import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { consultations } from "./consultations.js";
import { conversationMessages } from "./conversation-messages.js";
import { aiGenerationStatusEnum } from "./enums.js";
import { createdAt } from "./helpers.js";
import { organizations } from "./organizations.js";

export const aiGenerations = pgTable(
  "ai_generations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    consultationId: uuid("consultation_id")
      .notNull()
      .references(() => consultations.id, { onDelete: "cascade" }),
    conversationMessageId: uuid("conversation_message_id").references(
      () => conversationMessages.id,
      { onDelete: "set null" },
    ),
    provider: varchar("provider", { length: 64 }).notNull(),
    model: varchar("model", { length: 128 }).notNull(),
    promptType: varchar("prompt_type", { length: 64 }).notNull(),
    promptVersion: varchar("prompt_version", { length: 64 }).notNull(),
    requestTokens: integer("request_tokens").notNull().default(0),
    responseTokens: integer("response_tokens").notNull().default(0),
    totalTokens: integer("total_tokens").notNull().default(0),
    latencyMs: integer("latency_ms").notNull().default(0),
    estimatedCost: numeric("estimated_cost", {
      precision: 12,
      scale: 6,
    })
      .notNull()
      .default("0"),
    status: aiGenerationStatusEnum("status").notNull(),
    errorMessage: text("error_message"),
    createdAt,
  },
  (table) => [
    index("ai_generations_organization_id_idx").on(table.organizationId),
    index("ai_generations_consultation_id_idx").on(table.consultationId),
    index("ai_generations_created_at_idx").on(table.createdAt),
    index("ai_generations_status_idx").on(table.status),
  ],
);
