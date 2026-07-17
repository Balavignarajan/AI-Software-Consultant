import {
  boolean,
  index,
  numeric,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { consultations } from "./consultations.js";
import {
  featureComplexityEnum,
  featurePriorityEnum,
} from "./enums.js";
import { createdAt, deletedAt, updatedAt } from "./helpers.js";
import { organizations } from "./organizations.js";
import { requirementSummaries } from "./requirement-summaries.js";

export const detectedFeatures = pgTable(
  "detected_features",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    consultationId: uuid("consultation_id")
      .notNull()
      .references(() => consultations.id, { onDelete: "cascade" }),
    requirementSummaryId: uuid("requirement_summary_id")
      .notNull()
      .references(() => requirementSummaries.id, { onDelete: "cascade" }),
    featureName: varchar("feature_name", { length: 255 }).notNull(),
    featureCategory: varchar("feature_category", { length: 128 }).notNull(),
    description: text("description").notNull(),
    priority: featurePriorityEnum("priority").notNull(),
    complexity: featureComplexityEnum("complexity").notNull(),
    confidenceScore: numeric("confidence_score", {
      precision: 5,
      scale: 4,
    }).notNull(),
    aiReasoning: text("ai_reasoning").notNull(),
    manuallyVerified: boolean("manually_verified").notNull().default(false),
    createdAt,
    updatedAt,
    deletedAt,
  },
  (table) => [
    index("detected_features_organization_id_idx").on(table.organizationId),
    index("detected_features_consultation_id_idx").on(table.consultationId),
    index("detected_features_requirement_summary_id_idx").on(
      table.requirementSummaryId,
    ),
  ],
);
