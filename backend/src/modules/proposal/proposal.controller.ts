import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/errors/app-error.js";
import { successResponse } from "../../shared/responses/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { proposalService } from "./proposal.service.js";
import {
  consultationIdParamsSchema,
  updateProposalSchema,
} from "./proposal.validation.js";

function requireAuthenticatedUser(req: Request) {
  if (!req.user) {
    throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
  }

  return req.user;
}

export class ProposalController {
  generate = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = consultationIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? "Validation failed",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const result = await proposalService.generate(
      actor.organizationId,
      parsedParams.data.consultationId,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Proposal generated successfully.", result));
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

    const result = await proposalService.get(
      actor.organizationId,
      parsedParams.data.consultationId,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Proposal fetched successfully.", result));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const actor = requireAuthenticatedUser(req);
    const parsedParams = consultationIdParamsSchema.safeParse(req.params);
    const parsedBody = updateProposalSchema.safeParse(req.body);

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

    const result = await proposalService.update(
      actor.organizationId,
      parsedParams.data.consultationId,
      parsedBody.data,
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Proposal updated successfully.", result));
  });
}

export const proposalController = new ProposalController();
