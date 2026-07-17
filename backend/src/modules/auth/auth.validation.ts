import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
  .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
  .regex(/[0-9]/, "Password must contain at least 1 number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least 1 special character",
  );

export const registerSchema = z.object({
  organizationName: z
    .string()
    .trim()
    .min(3, "Organization name must be at least 3 characters")
    .max(100, "Organization name must be at most 100 characters"),
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name must be at most 100 characters"),
  email: z.string().trim().email("Email must be a valid email address"),
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
