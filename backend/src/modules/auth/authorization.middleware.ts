import type { NextFunction, Request, RequestHandler, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/errors/app-error.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { authorizationService } from "./authorization.service.js";
import type { PermissionCode } from "./permissions.constants.js";

export function authorize(
  ...requiredPermissions: PermissionCode[]
): RequestHandler {
  return asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
      }

      await authorizationService.assertHasPermissions(
        req.user.id,
        requiredPermissions,
      );

      next();
    },
  );
}
