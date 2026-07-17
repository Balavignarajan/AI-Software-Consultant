import { z } from "zod";

export const requirementSummaryParamsSchema = z.object({
  consultationId: z.string().uuid("Consultation id must be a valid UUID"),
});

const structuredSummarySchema = z.object({
  projectName: z.string(),
  projectType: z.string(),
  businessGoals: z.array(z.string()),
  targetUsers: z.array(z.string()),
  coreFeatures: z.array(z.string()),
  adminFeatures: z.array(z.string()),
  integrations: z.array(z.string()),
  nonFunctionalRequirements: z.array(z.string()),
  assumptions: z.array(z.string()),
  openQuestions: z.array(z.string()),
});

export const updateRequirementSummarySchema = z
  .object({
    summaryMarkdown: z.string().trim().min(1).optional(),
    structuredSummary: structuredSummarySchema.optional(),
    status: z.enum(["draft", "finalized"]).optional(),
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    "At least one field must be provided",
  );

export type UpdateRequirementSummaryInput = z.infer<
  typeof updateRequirementSummarySchema
>;

export const aiRequirementSummaryPayloadSchema = z.object({
  summaryMarkdown: z.string().min(1),
  structuredSummary: structuredSummarySchema,
});
