import { z } from "zod";

export const consultationIdParamsSchema = z.object({
  consultationId: z.string().uuid("Consultation id must be a valid UUID"),
});

const stringListSchema = z.array(z.string().trim().min(1)).min(1);

export const updateProposalSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    executiveSummary: z.string().trim().min(1).optional(),
    scopeOfWork: stringListSchema.optional(),
    deliverables: stringListSchema.optional(),
    timeline: z.string().trim().min(1).max(255).optional(),
    assumptions: z.string().trim().min(1).optional(),
    exclusions: z.string().trim().min(1).optional(),
    pricingNotes: z.string().trim().min(1).optional(),
    proposalMarkdown: z.string().trim().min(1).optional(),
    status: z.enum(["DRAFT", "REVIEWED", "APPROVED"]).optional(),
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    "At least one field must be provided",
  );

export type UpdateProposalInput = z.infer<typeof updateProposalSchema>;

export const aiProposalPayloadSchema = z.object({
  title: z.string().min(1),
  executiveSummary: z.string().min(1),
  scopeOfWork: stringListSchema,
  deliverables: stringListSchema,
  timeline: z.string().min(1),
  assumptions: z.array(z.string().min(1)).min(1),
  exclusions: z.array(z.string().min(1)).min(1),
  pricingNotes: z.string().min(1),
  proposalMarkdown: z.string().min(1),
});
