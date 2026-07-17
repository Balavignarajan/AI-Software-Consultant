import { z } from "zod";

export const consultationIdParamsSchema = z.object({
  consultationId: z.string().uuid("Consultation id must be a valid UUID"),
});

export const featureIdParamsSchema = z.object({
  featureId: z.string().uuid("Feature id must be a valid UUID"),
});

export const updateFeatureSchema = z
  .object({
    featureName: z.string().trim().min(1).max(255).optional(),
    featureCategory: z.string().trim().min(1).max(128).optional(),
    description: z.string().trim().min(1).optional(),
    priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
    complexity: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    manuallyVerified: z.boolean().optional(),
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    "At least one field must be provided",
  );

export type UpdateFeatureInput = z.infer<typeof updateFeatureSchema>;

export const aiDetectedFeaturesPayloadSchema = z.object({
  features: z
    .array(
      z.object({
        name: z.string().min(1),
        category: z.string().min(1),
        description: z.string().min(1),
        priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
        complexity: z.enum(["LOW", "MEDIUM", "HIGH"]),
        confidence: z.number().min(0).max(1),
        reasoning: z.string().min(1),
      }),
    )
    .min(1),
});
