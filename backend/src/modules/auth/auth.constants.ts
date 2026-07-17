export const TOKEN_TYPE = "Bearer" as const;

export const AUTH_HEADER = "Authorization" as const;

export const COOKIE_NAMES = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

export const BCRYPT_SALT_ROUNDS = 12;

export const TOKEN_KINDS = {
  ACCESS: "access",
  REFRESH: "refresh",
} as const;
