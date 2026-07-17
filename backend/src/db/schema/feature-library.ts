import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { featureComplexityEnum } from "./enums.js";
import { createdAt, deletedAt, updatedAt } from "./helpers.js";
import { organizations } from "./organizations.js";

export const featureLibrary = pgTable(
  "feature_library",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 128 }).notNull(),
    description: text("description").notNull(),
    defaultComplexity: featureComplexityEnum("default_complexity").notNull(),
    defaultEstimatedHours: integer("default_estimated_hours").notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    technologies: jsonb("technologies").$type<string[]>().notNull().default([]),
    notes: text("notes"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt,
    updatedAt,
    deletedAt,
  },
  (table) => [
    index("feature_library_organization_id_idx").on(table.organizationId),
    index("feature_library_category_idx").on(table.category),
    index("feature_library_name_idx").on(table.name),
  ],
);
