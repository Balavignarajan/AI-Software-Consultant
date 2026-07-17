import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import { authorize } from "../auth/authorization.middleware.js";
import { PERMISSIONS } from "../auth/permissions.constants.js";
import { featureLibraryController } from "./feature-library.controller.js";

export const featureLibraryRouter = Router();

featureLibraryRouter.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.FEATURE_LIBRARY_READ),
  featureLibraryController.list,
);

featureLibraryRouter.post(
  "/match",
  authenticate,
  authorize(PERMISSIONS.FEATURE_LIBRARY_READ),
  featureLibraryController.match,
);

featureLibraryRouter.get(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.FEATURE_LIBRARY_READ),
  featureLibraryController.getById,
);

featureLibraryRouter.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.FEATURE_LIBRARY_MANAGE),
  featureLibraryController.create,
);

featureLibraryRouter.patch(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.FEATURE_LIBRARY_MANAGE),
  featureLibraryController.update,
);

featureLibraryRouter.delete(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.FEATURE_LIBRARY_MANAGE),
  featureLibraryController.remove,
);
