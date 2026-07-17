import {
  index,
  jsonb,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { updatedAt } from "./helpers.js";
import { users } from "./users.js";

export const userSettings = pgTable(
  "user_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 128 }).notNull(),
    value: jsonb("value").$type<Record<string, unknown>>().notNull(),
    updatedAt,
  },
  (table) => [
    uniqueIndex("user_settings_user_key_uidx").on(table.userId, table.key),
    index("user_settings_user_id_idx").on(table.userId),
  ],
);
