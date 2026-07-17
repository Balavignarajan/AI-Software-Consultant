import {
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { consultations } from "./consultations.js";
import {
  featureComplexityEnum,
  requirementSummaryGeneratedByEnum,
} from "./enums.js";
import { createdAt, deletedAt, updatedAt } from "./helpers.js";
import { organizations } from "./organizations.js";
import { requirementSummaries } from "./requirement-summaries.js";

export type EstimationRisk = string;

export type EstimationBreakdownItem = {
  category: string;
  hours: number;
};

export const projectEstimations = pgTable(
  "project_estimations",
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
    estimatedHours: integer("estimated_hours").notNull(),
    estimatedWeeks: integer("estimated_weeks").notNull(),
    estimatedTeamSize: integer("estimated_team_size").notNull(),
    complexity: featureComplexityEnum("complexity").notNull(),
    confidenceScore: numeric("confidence_score", {
      precision: 5,
      scale: 4,
    }).notNull(),
    assumptions: text("assumptions").notNull(),
    risks: jsonb("risks").$type<EstimationRisk[]>().notNull(),
    breakdown: jsonb("breakdown").$type<EstimationBreakdownItem[]>().notNull(),
    generatedBy: requirementSummaryGeneratedByEnum("generated_by")
      .notNull()
      .default("AI"),
    version: integer("version").notNull().default(1),
    createdAt,
    updatedAt,
    deletedAt,
  },
  (table) => [
    uniqueIndex("project_estimations_consultation_id_uidx").on(
      table.consultationId,
    ),
    index("project_estimations_organization_id_idx").on(table.organizationId),
    index("project_estimations_requirement_summary_id_idx").on(
      table.requirementSummaryId,
    ),
  ],
);
