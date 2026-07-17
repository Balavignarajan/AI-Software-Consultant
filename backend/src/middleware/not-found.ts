import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../shared/constants/http-status.js";
import { AppError } from "../shared/errors/app-error.js";

export function notFound(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(
    new AppError(
      `Route ${req.originalUrl} not found`,
      HTTP_STATUS.NOT_FOUND,
    ),
  );
}
