import {
  index,
  jsonb,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { consultations } from "./consultations.js";
import { messageSenderTypeEnum } from "./enums.js";
import { createdAt, deletedAt } from "./helpers.js";
import { organizations } from "./organizations.js";
import { users } from "./users.js";

export const conversationMessages = pgTable(
  "conversation_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    consultationId: uuid("consultation_id")
      .notNull()
      .references(() => consultations.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    senderType: messageSenderTypeEnum("sender_type").notNull(),
    message: text("message").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt,
    deletedAt,
  },
  (table) => [
    index("conversation_messages_consultation_id_idx").on(
      table.consultationId,
    ),
    index("conversation_messages_organization_id_idx").on(
      table.organizationId,
    ),
  ],
);
