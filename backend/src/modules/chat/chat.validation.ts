import { z } from "zod";

export const chatParamsSchema = z.object({
  consultationId: z.string().uuid("Consultation id must be a valid UUID"),
});

export const chatBodySchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(10000, "Message must be at most 10000 characters"),
});

export type ChatBodyInput = z.infer<typeof chatBodySchema>;
