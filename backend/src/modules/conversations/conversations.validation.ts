import { z } from "zod";

export const consultationIdParamsSchema = z.object({
  consultationId: z.string().uuid("Consultation id must be a valid UUID"),
});

export const messageIdParamsSchema = z.object({
  id: z.string().uuid("Message id must be a valid UUID"),
});

export const createMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(10000, "Message must be at most 10000 characters"),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const updateMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(10000, "Message must be at most 10000 characters"),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
