import { pgTable, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, deletedAt, updatedAt } from "./helpers.js";

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    plan: varchar("plan", { length: 64 }).notNull().default("free"),
    status: varchar("status", { length: 64 }).notNull().default("active"),
    billingEmail: varchar("billing_email", { length: 255 }),
    timezone: varchar("timezone", { length: 64 }).notNull().default("UTC"),
    createdAt,
    updatedAt,
    deletedAt,
  },
  (table) => [uniqueIndex("organizations_slug_uidx").on(table.slug)],
);
