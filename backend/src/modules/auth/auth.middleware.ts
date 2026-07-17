import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/errors/app-error.js";
import { logger } from "../../shared/logger/logger.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AUTH_HEADER, TOKEN_TYPE } from "./auth.constants.js";
import { authRepository } from "./auth.repository.js";
import type { AuthenticatedUser } from "./auth.types.js";
import { verifyAccessToken } from "./jwt.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUser;
  }
}

function extractBearerToken(authorizationHeader: string | undefined): string {
  if (!authorizationHeader) {
    throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== TOKEN_TYPE || !token) {
    throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  }

  return token;
}

function toAuthenticatedUser(user: {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  status: string;
}): AuthenticatedUser {
  return {
    id: user.id,
    organizationId: user.organizationId,
    email: user.email,
    fullName: user.fullName,
    status: user.status,
  };
}

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractBearerToken(req.get(AUTH_HEADER) ?? undefined);

    let userId: string;

    try {
      const claims = verifyAccessToken(token);
      userId = claims.sub;
    } catch {
      logger.warn("Access token verification failed");
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    if (user.status !== "active") {
      throw new AppError("Account is not active", HTTP_STATUS.FORBIDDEN);
    }

    req.user = toAuthenticatedUser(user);
    next();
  },
);
