import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/errors/app-error.js";
import { successResponse } from "../../shared/responses/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { featureLibraryService } from "./feature-library.service.js";
import {
  createFeatureLibrarySchema,
  featureLibraryIdParamsSchema,
  listFeatureLibraryQuerySchema,
  matchDetectedFeaturesSchema,
  updateFeatureLibrarySchema,
} from "./feature-library.validation.js";

function requireAuthenticatedUser(req: Request) {
  if (!req.user) {
    throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  }

  return req.user;
}

export class FeatureLibraryController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedQuery = listFeatureLibraryQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      throw new AppError(
        parsedQuery.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const result = await featureLibraryService.list(
      actor.organizationId,
      parsedQuery.data,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Feature library fetched successfully.", result));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = featureLibraryIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const result = await featureLibraryService.getById(
      actor.organizationId,
      parsedParams.data.id,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(
        successResponse("Feature library item fetched successfully.", result),
      );
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedBody = createFeatureLibrarySchema.safeParse(req.body);

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const result = await featureLibraryService.create(
      actor.organizationId,
      parsedBody.data,
    );

    res
      .status(HTTP_STATUS.CREATED)
      .json(
        successResponse("Feature library item created successfully.", result),
      );
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = featureLibraryIdParamsSchema.safeParse(req.params);
    const parsedBody = updateFeatureLibrarySchema.safeParse(req.body);

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

    const result = await featureLibraryService.update(
      actor.organizationId,
      parsedParams.data.id,
      parsedBody.data,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(
        successResponse("Feature library item updated successfully.", result),
      );
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = featureLibraryIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    await featureLibraryService.remove(
      actor.organizationId,
      parsedParams.data.id,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(
        successResponse("Feature library item deleted successfully.", null),
      );
  });

  match = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedBody = matchDetectedFeaturesSchema.safeParse(req.body);

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const result = await featureLibraryService.matchDetectedFeatures(
      actor.organizationId,
      parsedBody.data,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(
        successResponse("Feature matching suggestions generated.", result),
      );
  });
}

export const featureLibraryController = new FeatureLibraryController();
