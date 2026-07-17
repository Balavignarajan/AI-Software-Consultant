import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/errors/app-error.js";
import { successResponse } from "../../shared/responses/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { estimationService } from "./estimation.service.js";
import {
  consultationIdParamsSchema,
  updateEstimationSchema,
} from "./estimation.validation.js";

function requireAuthenticatedUser(req: Request) {
  if (!req.user) {
    throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  }

  return req.user;
}

export class EstimationController {
  generate = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = consultationIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const result = await estimationService.generate(
      actor.organizationId,
      parsedParams.data.consultationId,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Estimation generated successfully.", result));
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = consultationIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const result = await estimationService.get(
      actor.organizationId,
      parsedParams.data.consultationId,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Estimation fetched successfully.", result));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = consultationIdParamsSchema.safeParse(req.params);
    const parsedBody = updateEstimationSchema.safeParse(req.body);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const result = await estimationService.update(
      actor.organizationId,
      parsedParams.data.consultationId,
      parsedBody.data,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Estimation updated successfully.", result));
  });
}

export const estimationController = new EstimationController();
