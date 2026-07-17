import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/errors/app-error.js";
import { successResponse } from "../../shared/responses/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { featureDetectionService } from "./feature-detection.service.js";
import {
  consultationIdParamsSchema,
  featureIdParamsSchema,
  updateFeatureSchema,
} from "./feature-detection.validation.js";

function requireAuthenticatedUser(req: Request) {
  if (!req.user) {
    throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  }

  return req.user;
}

export class FeatureDetectionController {
  detect = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = consultationIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const result = await featureDetectionService.detect(
      actor.organizationId,
      parsedParams.data.consultationId,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Features detected successfully.", result));
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = consultationIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const result = await featureDetectionService.list(
      actor.organizationId,
      parsedParams.data.consultationId,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Features fetched successfully.", result));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = featureIdParamsSchema.safeParse(req.params);
    const parsedBody = updateFeatureSchema.safeParse(req.body);

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

    const result = await featureDetectionService.update(
      actor.organizationId,
      parsedParams.data.featureId,
      parsedBody.data,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Feature updated successfully.", result));
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = featureIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    await featureDetectionService.remove(
      actor.organizationId,
      parsedParams.data.featureId,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Feature deleted successfully.", null));
  });
}

export const featureDetectionController = new FeatureDetectionController();
