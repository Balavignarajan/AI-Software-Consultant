import { z } from "zod";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "../../shared/constants/app.js";

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

export const userIdParamsSchema = z.object({
  id: z.string().uuid("User id must be a valid UUID"),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  search: z.string().trim().optional(),
});

export const createUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name must be at most 100 characters"),
  email: z.string().trim().email("Email must be a valid email address"),
  password: passwordSchema,
  phone: z.string().trim().max(64).nullish(),
  avatarUrl: z
    .union([z.string().trim().url("Avatar URL must be valid"), z.null()])
    .optional(),
  roleIds: z
    .array(z.string().uuid("Role id must be a valid UUID"))
    .min(1, "At least one role is required"),
});

export const updateUserSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters")
      .max(100, "Full name must be at most 100 characters")
      .optional(),
    phone: z.string().trim().max(64).nullish(),
    avatarUrl: z
      .union([z.string().trim().url("Avatar URL must be valid"), z.null()])
      .optional(),
    status: z.enum(["active", "inactive", "suspended"]).optional(),
    roleIds: z
      .array(z.string().uuid("Role id must be a valid UUID"))
      .min(1, "At least one role is required")
      .optional(),
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    "At least one field must be provided",
  );

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
