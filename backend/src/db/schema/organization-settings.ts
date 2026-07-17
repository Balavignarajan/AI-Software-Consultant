import {
  index,
  jsonb,
  pgTable,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { updatedAt } from "./helpers.js";
import { organizations } from "./organizations.js";

export const organizationSettings = pgTable(
  "organization_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 128 }).notNull(),
    value: jsonb("value").$type<Record<string, unknown>>().notNull(),
    updatedAt,
  },
  (table) => [
    uniqueIndex("organization_settings_org_key_uidx").on(
      table.organizationId,
      table.key,
    ),
    index("organization_settings_organization_id_idx").on(table.organizationId),
  ],
);
