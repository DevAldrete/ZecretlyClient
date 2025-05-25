// src/modules/collections/collections.controller.ts
import { Request, Response, NextFunction } from "express";
import { CollectionService } from "./collections.service";
import { CreateCollectionInput, UpdateCollectionBody, UpdateCollectionParams, CollectionIdParams } from "./collections.schemas";

export class CollectionController {
  private service: CollectionService;

  constructor() {
    this.service = new CollectionService(); // Or inject
  }

  async createCollectionHandler(
    req: Request<{}, {}, CreateCollectionInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const collection = await this.service.createCollection(req.body);
      res.status(201).json({
        success: true,
        data: collection,
        message: "Collection created successfully",
      });
    } catch (error) {
      next(error); // Pass to error handling middleware
    }
  }

  async getAllCollectionsHandler(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const collections = await this.service.getAllCollections();
      res.status(200).json({
        success: true,
        data: collections,
        message: "Collections retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getCollectionsByWorkspaceHandler(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const collections = await this.service.getCollectionsByWorkspace(req.params.workspaceId);
      res.status(200).json({
        success: true,
        data: collections,
        message: "Collections retrieved successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Workspace not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  async getCollectionByIdHandler(
    req: Request<CollectionIdParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const collection = await this.service.getCollectionById(req.params.collectionId);
      res.status(200).json({
        success: true,
        data: collection,
        message: "Collection retrieved successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Collection not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  async updateCollectionHandler(
    req: Request<UpdateCollectionParams, {}, UpdateCollectionBody>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const collection = await this.service.updateCollection(req.params.collectionId, req.body);
      res.status(200).json({
        success: true,
        data: collection,
        message: "Collection updated successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Collection not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  async deleteCollectionHandler(
    req: Request<CollectionIdParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await this.service.deleteCollection(req.params.collectionId);
      res.status(200).json({
        success: true,
        message: "Collection deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Collection not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
}
