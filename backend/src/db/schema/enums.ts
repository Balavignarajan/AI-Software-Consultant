import { pgEnum } from "drizzle-orm/pg-core";

export const verificationTokenTypeEnum = pgEnum("verification_token_type", [
  "EMAIL_VERIFY",
  "PASSWORD_RESET",
  "INVITATION",
]);
