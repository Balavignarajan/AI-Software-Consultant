import type { StructuredRequirementSummary } from "../../db/schema/requirement-summaries.js";

export type ConsultationSummaryDto = {
  id: string;
  title: string;
  status: string;
  industry: string | null;
  projectType: string | null;
  budgetRange: string | null;
  timeline: string | null;
};

export type RequirementSummaryDto = {
  id: string;
  organizationId: string;
  consultationId: string;
  summaryMarkdown: string;
  structuredSummary: StructuredRequirementSummary;
  version: number;
  status: "draft" | "finalized";
  generatedBy: "AI" | "USER";
  createdAt: Date;
  updatedAt: Date;
};

export type RequirementSummaryResponseDto = {
  consultation: ConsultationSummaryDto;
  summary: string;
  structuredSummary: StructuredRequirementSummary;
  version: number;
  status: "draft" | "finalized";
  generatedBy: "AI" | "USER";
  updatedAt: Date;
};
