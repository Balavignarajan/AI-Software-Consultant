import type { ErrorRequestHandler } from "express";
import { HTTP_STATUS } from "../shared/constants/http-status.js";
import { AppError } from "../shared/errors/app-error.js";
import { logger } from "../shared/logger/logger.js";
import { errorResponse } from "../shared/responses/api-response.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json(errorResponse(err.message));
    return;
  }

  const message = err instanceof Error ? err.message : "Unknown error";
  logger.error(message);

  res
    .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    .json(errorResponse("Internal server error"));
};
