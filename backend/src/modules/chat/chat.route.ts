import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import { authorize } from "../auth/authorization.middleware.js";
import { PERMISSIONS } from "../auth/permissions.constants.js";
import { chatController } from "./chat.controller.js";

export const chatRouter = Router({ mergeParams: true });

chatRouter.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_UPDATE),
  chatController.chat,
);
