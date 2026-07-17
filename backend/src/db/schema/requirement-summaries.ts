import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { consultations } from "./consultations.js";
import {
  requirementSummaryGeneratedByEnum,
  requirementSummaryStatusEnum,
} from "./enums.js";
import { createdAt, deletedAt, updatedAt } from "./helpers.js";
import { organizations } from "./organizations.js";

export type StructuredRequirementSummary = {
  projectName: string;
  projectType: string;
  businessGoals: string[];
  targetUsers: string[];
  coreFeatures: string[];
  adminFeatures: string[];
  integrations: string[];
  nonFunctionalRequirements: string[];
  assumptions: string[];
  openQuestions: string[];
};

export const requirementSummaries = pgTable(
  "requirement_summaries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    consultationId: uuid("consultation_id")
      .notNull()
      .references(() => consultations.id, { onDelete: "cascade" }),
    summaryMarkdown: text("summary_markdown").notNull(),
    structuredSummary: jsonb("structured_summary")
      .$type<StructuredRequirementSummary>()
      .notNull(),
    version: integer("version").notNull().default(1),
    status: requirementSummaryStatusEnum("status").notNull().default("draft"),
    generatedBy: requirementSummaryGeneratedByEnum("generated_by")
      .notNull()
      .default("AI"),
    createdAt,
    updatedAt,
    deletedAt,
  },
  (table) => [
    uniqueIndex("requirement_summaries_consultation_id_uidx").on(
      table.consultationId,
    ),
    index("requirement_summaries_organization_id_idx").on(table.organizationId),
  ],
);
