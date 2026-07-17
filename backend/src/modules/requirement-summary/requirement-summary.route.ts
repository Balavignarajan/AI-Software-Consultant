import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import { authorize } from "../auth/authorization.middleware.js";
import { PERMISSIONS } from "../auth/permissions.constants.js";
import { requirementSummaryController } from "./requirement-summary.controller.js";

export const requirementSummaryRouter = Router({ mergeParams: true });

requirementSummaryRouter.post(
  "/generate",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_UPDATE),
  requirementSummaryController.generate,
);

requirementSummaryRouter.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_READ),
  requirementSummaryController.get,
);

requirementSummaryRouter.patch(
  "/",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_UPDATE),
  requirementSummaryController.update,
);
