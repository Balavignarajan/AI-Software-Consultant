import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/errors/app-error.js";
import { successResponse } from "../../shared/responses/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { chatService } from "./chat.service.js";
import { chatBodySchema, chatParamsSchema } from "./chat.validation.js";

function requireAuthenticatedUser(req: Request) {
  if (!req.user) {
    throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  }

  return req.user;
}

export class ChatController {
  chat = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = chatParamsSchema.safeParse(req.params);
    const parsedBody = chatBodySchema.safeParse(req.body);

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

    const result = await chatService.chat(
      actor.organizationId,
      parsedParams.data.consultationId,
      actor.id,
      parsedBody.data.message,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Chat response generated successfully.", result));
  });
}

export const chatController = new ChatController();
