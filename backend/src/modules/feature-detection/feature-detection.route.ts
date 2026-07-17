import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import { authorize } from "../auth/authorization.middleware.js";
import { PERMISSIONS } from "../auth/permissions.constants.js";
import { featureDetectionController } from "./feature-detection.controller.js";

export const consultationFeaturesRouter = Router({ mergeParams: true });
export const featuresRouter = Router();

consultationFeaturesRouter.post(
  "/detect",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_UPDATE),
  featureDetectionController.detect,
);

consultationFeaturesRouter.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_READ),
  featureDetectionController.list,
);

featuresRouter.patch(
  "/:featureId",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_UPDATE),
  featureDetectionController.update,
);

featuresRouter.delete(
  "/:featureId",
  authenticate,
  authorize(PERMISSIONS.CONSULTATION_UPDATE),
  featureDetectionController.remove,
);
