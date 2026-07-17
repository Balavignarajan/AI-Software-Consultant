import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { verificationTokenTypeEnum } from "./enums.js";
import { createdAt } from "./helpers.js";
import { users } from "./users.js";

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: verificationTokenTypeEnum("type").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt,
  },
  (table) => [index("verification_tokens_user_id_idx").on(table.userId)],
);
