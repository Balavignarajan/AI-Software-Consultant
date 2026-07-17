import type {
  EstimationBreakdownItem,
  EstimationRisk,
} from "../../db/schema/project-estimations.js";

export type EstimationDto = {
  id: string;
  organizationId: string;
  consultationId: string;
  requirementSummaryId: string;
  estimatedHours: number;
  estimatedWeeks: number;
  estimatedTeamSize: number;
  complexity: "LOW" | "MEDIUM" | "HIGH";
  confidenceScore: number;
  assumptions: string;
  risks: EstimationRisk[];
  breakdown: EstimationBreakdownItem[];
  generatedBy: "AI" | "USER";
  version: number;
  createdAt: Date;
  updatedAt: Date;
};
