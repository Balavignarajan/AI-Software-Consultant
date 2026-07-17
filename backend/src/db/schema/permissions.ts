import { pgTable, text, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const permissions = pgTable(
  "permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 128 }).notNull(),
    module: varchar("module", { length: 128 }).notNull(),
    description: text("description"),
  },
  (table) => [uniqueIndex("permissions_code_uidx").on(table.code)],
);
