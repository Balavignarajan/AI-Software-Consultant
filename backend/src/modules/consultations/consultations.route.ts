import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import { authorize } from "../auth/authorization.middleware.js";
import { PERMISSIONS } from "../auth/permissions.constants.js";
import { consultationsController } from "./consultations.controller.js";

export const consultationsRouter = Router();

consultationsRouter.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_READ),
  consultationsController.list,
);

consultationsRouter.get(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_READ),
  consultationsController.getById,
);

consultationsRouter.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_CREATE),
  consultationsController.create,
);

consultationsRouter.patch(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_UPDATE),
  consultationsController.update,
);

consultationsRouter.delete(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_DELETE),
  consultationsController.remove,
);
