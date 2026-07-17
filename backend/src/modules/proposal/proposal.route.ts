import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import { authorize } from "../auth/authorization.middleware.js";
import { PERMISSIONS } from "../auth/permissions.constants.js";
import { proposalController } from "./proposal.controller.js";

export const proposalRouter = Router({ mergeParams: true });

proposalRouter.post(
  "/generate",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_UPDATE),
  proposalController.generate,
);

proposalRouter.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_READ),
  proposalController.get,
);

proposalRouter.patch(
  "/",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_UPDATE),
  proposalController.update,
);
