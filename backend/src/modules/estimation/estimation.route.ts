import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import { authorize } from "../auth/authorization.middleware.js";
import { PERMISSIONS } from "../auth/permissions.constants.js";
import { estimationController } from "./estimation.controller.js";

export const estimationRouter = Router({ mergeParams: true });

estimationRouter.post(
  "/generate",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_UPDATE),
  estimationController.generate,
);

estimationRouter.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_READ),
  estimationController.get,
);

estimationRouter.patch(
  "/",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_UPDATE),
  estimationController.update,
);
