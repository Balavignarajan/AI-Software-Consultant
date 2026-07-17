import { z } from "zod";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "../../shared/constants/app.js";

export const featureLibraryIdParamsSchema = z.object({
  id: z.string().uuid("Feature library id must be a valid UUID"),
});

export const listFeatureLibraryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  name: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  tag: z.string().trim().min(1).optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) =>
      value === undefined ? undefined : value === "true",
    ),
});

export const createFeatureLibrarySchema = z.object({
  name: z.string().trim().min(1).max(255),
  category: z.string().trim().min(1).max(128),
  description: z.string().trim().min(1),
  defaultComplexity: z.enum(["LOW", "MEDIUM", "HIGH"]),
  defaultEstimatedHours: z.number().int().positive(),
  tags: z.array(z.string().trim().min(1)).default([]),
  technologies: z.array(z.string().trim().min(1)).default([]),
  notes: z.string().trim().min(1).nullish(),
  isActive: z.boolean().optional().default(true),
});

export const updateFeatureLibrarySchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    category: z.string().trim().min(1).max(128).optional(),
    description: z.string().trim().min(1).optional(),
    defaultComplexity: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    defaultEstimatedHours: z.number().int().positive().optional(),
    tags: z.array(z.string().trim().min(1)).optional(),
    technologies: z.array(z.string().trim().min(1)).optional(),
    notes: z.string().trim().min(1).nullish(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    "At least one field must be provided",
  );

export const matchDetectedFeaturesSchema = z.object({
  consultationId: z.string().uuid("Consultation id must be a valid UUID"),
});

export const aiFeatureMatchingPayloadSchema = z.object({
  matches: z.array(
    z.object({
      detectedFeatureId: z.string().uuid(),
      libraryFeatureId: z.string().uuid().nullable(),
      confidence: z.number().min(0).max(1),
      recommendation: z.string().min(1),
    }),
  ),
});

export type ListFeatureLibraryQuery = z.infer<
  typeof listFeatureLibraryQuerySchema
>;
export type CreateFeatureLibraryInput = z.infer<
  typeof createFeatureLibrarySchema
>;
export type UpdateFeatureLibraryInput = z.infer<
  typeof updateFeatureLibrarySchema
>;
export type MatchDetectedFeaturesInput = z.infer<
  typeof matchDetectedFeaturesSchema
>;
