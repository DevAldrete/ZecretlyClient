// src/modules/collections/collections.routes.ts
import { Router } from "express";
import { CollectionController } from "./collections.controller";
import { validate } from "../../middleware/validationMiddleware";
import {
  createCollectionSchema,
  updateCollectionSchema,
  collectionIdParamSchema,
} from "./collections.schemas";

const router = Router();
const controller = new CollectionController();

router.post(
  "/",
  validate(createCollectionSchema),
  (req, res, next) => controller.createCollectionHandler(req, res, next), // Wrap for correct `this`
);

router.get(
  "/",
  (req, res, next) => controller.getAllCollectionsHandler(req, res, next),
);

router.get(
  "/workspace/:workspaceId",
  (req, res, next) => controller.getCollectionsByWorkspaceHandler(req, res, next),
);

router.get(
  "/:collectionId",
  validate(collectionIdParamSchema),
  (req, res, next) => controller.getCollectionByIdHandler(req, res, next),
);

router.put(
  "/:collectionId",
  validate(updateCollectionSchema),
  (req, res, next) => controller.updateCollectionHandler(req, res, next),
);

router.delete(
  "/:collectionId",
  validate(collectionIdParamSchema),
  (req, res, next) => controller.deleteCollectionHandler(req, res, next),
);

export const collectionsRoutes = router;
