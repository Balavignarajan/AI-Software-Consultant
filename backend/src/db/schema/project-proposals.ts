import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { consultations } from "./consultations.js";
import {
  proposalStatusEnum,
  requirementSummaryGeneratedByEnum,
} from "./enums.js";
import { createdAt, deletedAt, updatedAt } from "./helpers.js";
import { organizations } from "./organizations.js";
import { projectEstimations } from "./project-estimations.js";
import { requirementSummaries } from "./requirement-summaries.js";

export const projectProposals = pgTable(
  "project_proposals",
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
    estimationId: uuid("estimation_id")
      .notNull()
      .references(() => projectEstimations.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    executiveSummary: text("executive_summary").notNull(),
    scopeOfWork: jsonb("scope_of_work").$type<string[]>().notNull(),
    deliverables: jsonb("deliverables").$type<string[]>().notNull(),
    timeline: varchar("timeline", { length: 255 }).notNull(),
    assumptions: text("assumptions").notNull(),
    exclusions: text("exclusions").notNull(),
    pricingNotes: text("pricing_notes").notNull(),
    proposalMarkdown: text("proposal_markdown").notNull(),
    generatedBy: requirementSummaryGeneratedByEnum("generated_by")
      .notNull()
      .default("AI"),
    version: integer("version").notNull().default(1),
    status: proposalStatusEnum("status").notNull().default("DRAFT"),
    createdAt,
    updatedAt,
    deletedAt,
  },
  (table) => [
    uniqueIndex("project_proposals_consultation_id_uidx").on(
      table.consultationId,
    ),
    index("project_proposals_organization_id_idx").on(table.organizationId),
    index("project_proposals_requirement_summary_id_idx").on(
      table.requirementSummaryId,
    ),
    index("project_proposals_estimation_id_idx").on(table.estimationId),
  ],
);
