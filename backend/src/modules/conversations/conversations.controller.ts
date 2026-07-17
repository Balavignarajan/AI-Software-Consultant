import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/errors/app-error.js";
import { successResponse } from "../../shared/responses/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { conversationsService } from "./conversations.service.js";
import {
  consultationIdParamsSchema,
  createMessageSchema,
  messageIdParamsSchema,
  updateMessageSchema,
} from "./conversations.validation.js";

function requireAuthenticatedUser(req: Request) {
  if (!req.user) {
    throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  }

  return req.user;
}

export class ConversationsController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = consultationIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const result = await conversationsService.listByConsultation(
      actor.organizationId,
      parsedParams.data.consultationId,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Messages fetched successfully.", result));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = consultationIdParamsSchema.safeParse(req.params);
    const parsedBody = createMessageSchema.safeParse(req.body);

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

    const result = await conversationsService.createUserMessage(
      actor.organizationId,
      parsedParams.data.consultationId,
      actor.id,
      parsedBody.data,
    );

    res
      .status(HTTP_STATUS.CREATED)
      .json(successResponse("Message created successfully.", result));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = messageIdParamsSchema.safeParse(req.params);
    const parsedBody = updateMessageSchema.safeParse(req.body);

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

    const result = await conversationsService.updateUserMessage(
      actor.organizationId,
      parsedParams.data.id,
      parsedBody.data,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Message updated successfully.", result));
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = messageIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    await conversationsService.remove(
      actor.organizationId,
      parsedParams.data.id,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Message deleted successfully.", null));
  });
}

export const conversationsController = new ConversationsController();
