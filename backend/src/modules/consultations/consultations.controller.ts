import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/errors/app-error.js";
import { successResponse } from "../../shared/responses/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { consultationsService } from "./consultations.service.js";
import {
  consultationIdParamsSchema,
  createConsultationSchema,
  listConsultationsQuerySchema,
  updateConsultationSchema,
} from "./consultations.validation.js";

function requireAuthenticatedUser(req: Request) {
  if (!req.user) {
    throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  }

  return req.user;
}

export class ConsultationsController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedQuery = listConsultationsQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      throw new AppError(
        parsedQuery.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const result = await consultationsService.list(
      actor.organizationId,
      parsedQuery.data,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Consultations fetched successfully.", result));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = consultationIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const result = await consultationsService.getById(
      actor.organizationId,
      parsedParams.data.id,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Consultation fetched successfully.", result));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedBody = createConsultationSchema.safeParse(req.body);

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const result = await consultationsService.create(
      actor.organizationId,
      actor.id,
      parsedBody.data,
    );

    res
      .status(HTTP_STATUS.CREATED)
      .json(successResponse("Consultation created successfully.", result));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = consultationIdParamsSchema.safeParse(req.params);
    const parsedBody = updateConsultationSchema.safeParse(req.body);

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

    const result = await consultationsService.update(
      actor.organizationId,
      parsedParams.data.id,
      parsedBody.data,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Consultation updated successfully.", result));
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = consultationIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    await consultationsService.remove(
      actor.organizationId,
      parsedParams.data.id,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Consultation deleted successfully.", null));
  });
}

export const consultationsController = new ConsultationsController();
