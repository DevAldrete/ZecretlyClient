import { Request, Response, NextFunction } from "express";
import { RequestHistoryService } from "./reqhistories.service";
import {
  createRequestHistorySchema,
  updateRequestHistorySchema,
  requestHistoryIdParamSchema,
  requestHistoryByRequestSchema,
  requestHistoryByCollectionSchema,
  requestHistoryByWorkspaceSchema,
} from "./reqhistories.schemas";

export class RequestHistoryController {
  private requestHistoryService: RequestHistoryService;

  constructor() {
    this.requestHistoryService = new RequestHistoryService();
  }

  getAllRequestHistories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const histories = await this.requestHistoryService.getAllRequestHistories();
      res.status(200).json({
        success: true,
        data: histories,
        message: "Request histories retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getRequestHistoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params } = requestHistoryIdParamSchema.parse({ params: req.params });
      const history = await this.requestHistoryService.getRequestHistoryById(params.historyId);

      res.status(200).json({
        success: true,
        data: history,
        message: "Request history retrieved successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Request history not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  getRequestHistoriesByRequestId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params } = requestHistoryByRequestSchema.parse({ params: req.params });
      const histories = await this.requestHistoryService.getRequestHistoriesByRequestId(params.requestId);

      res.status(200).json({
        success: true,
        data: histories,
        message: "Request histories retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getRequestHistoriesByCollectionId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params } = requestHistoryByCollectionSchema.parse({ params: req.params });
      const histories = await this.requestHistoryService.getRequestHistoriesByCollectionId(params.collectionId);

      res.status(200).json({
        success: true,
        data: histories,
        message: "Request histories retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getRequestHistoriesByWorkspaceId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params } = requestHistoryByWorkspaceSchema.parse({ params: req.params });
      const histories = await this.requestHistoryService.getRequestHistoriesByWorkspaceId(params.workspaceId);

      res.status(200).json({
        success: true,
        data: histories,
        message: "Request histories retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  createRequestHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = createRequestHistorySchema.parse({ body: req.body });
      const newHistory = await this.requestHistoryService.createRequestHistory(body);

      res.status(201).json({
        success: true,
        data: newHistory,
        message: "Request history created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateRequestHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params, body } = updateRequestHistorySchema.parse({
        params: req.params,
        body: req.body,
      });

      const updatedHistory = await this.requestHistoryService.updateRequestHistory(params.historyId, body);

      res.status(200).json({
        success: true,
        data: updatedHistory,
        message: "Request history updated successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Request history not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  deleteRequestHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params } = requestHistoryIdParamSchema.parse({ params: req.params });
      await this.requestHistoryService.deleteRequestHistory(params.historyId);

      res.status(200).json({
        success: true,
        message: "Request history deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Request history not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };
}
