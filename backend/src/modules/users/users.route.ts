import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import { authorize } from "../auth/authorization.middleware.js";
import { PERMISSIONS } from "../auth/permissions.constants.js";
import { usersController } from "./users.controller.js";

export const usersRouter = Router();

usersRouter.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.USER_READ),
  usersController.list,
);

usersRouter.get(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.USER_READ),
  usersController.getById,
);

usersRouter.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.USER_CREATE),
  usersController.create,
);

usersRouter.patch(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.USER_UPDATE),
  usersController.update,
);

usersRouter.delete(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.USER_DELETE),
  usersController.remove,
);
