import jwt, { type SignOptions } from "jsonwebtoken";
import { config } from "../../config/env.js";
import { TOKEN_KINDS } from "./auth.constants.js";
import type {
  AccessTokenClaims,
  JwtPayload,
  RefreshTokenClaims,
} from "./auth.types.js";

type TokenInput = Omit<JwtPayload, "type">;

function isJwtPayload(value: unknown): value is JwtPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.sub === "string" &&
    typeof candidate.organizationId === "string" &&
    typeof candidate.email === "string" &&
    (candidate.type === TOKEN_KINDS.ACCESS ||
      candidate.type === TOKEN_KINDS.REFRESH)
  );
}

function signToken(
  payload: JwtPayload,
  secret: string,
  expiresIn: string,
): string {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
}

export function generateAccessToken(input: TokenInput): string {
  const payload: AccessTokenClaims = {
    ...input,
    type: TOKEN_KINDS.ACCESS,
  };

  return signToken(payload, config.JWT_SECRET, config.ACCESS_TOKEN_EXPIRES);
}

export function generateRefreshToken(input: TokenInput): string {
  const payload: RefreshTokenClaims = {
    ...input,
    type: TOKEN_KINDS.REFRESH,
  };

  return signToken(
    payload,
    config.JWT_REFRESH_SECRET,
    config.REFRESH_TOKEN_EXPIRES,
  );
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  const decoded: unknown = jwt.verify(token, config.JWT_SECRET);

  if (!isJwtPayload(decoded) || decoded.type !== TOKEN_KINDS.ACCESS) {
    throw new Error("Invalid access token");
  }

  return {
    sub: decoded.sub,
    organizationId: decoded.organizationId,
    email: decoded.email,
    type: TOKEN_KINDS.ACCESS,
  };
}

export function verifyRefreshToken(token: string): RefreshTokenClaims {
  const decoded: unknown = jwt.verify(token, config.JWT_REFRESH_SECRET);

  if (!isJwtPayload(decoded) || decoded.type !== TOKEN_KINDS.REFRESH) {
    throw new Error("Invalid refresh token");
  }

  return {
    sub: decoded.sub,
    organizationId: decoded.organizationId,
    email: decoded.email,
    type: TOKEN_KINDS.REFRESH,
  };
}
