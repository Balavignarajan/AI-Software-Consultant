import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import { authorize } from "../auth/authorization.middleware.js";
import { PERMISSIONS } from "../auth/permissions.constants.js";
import { conversationsController } from "./conversations.controller.js";

export const consultationMessagesRouter = Router({ mergeParams: true });
export const messagesRouter = Router();

consultationMessagesRouter.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_READ),
  conversationsController.list,
);

consultationMessagesRouter.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_UPDATE),
  conversationsController.create,
);

messagesRouter.patch(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_UPDATE),
  conversationsController.update,
);

messagesRouter.delete(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_UPDATE),
  conversationsController.remove,
);
