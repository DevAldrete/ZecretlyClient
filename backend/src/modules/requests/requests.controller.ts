import { Request, Response, NextFunction } from "express";
import { RequestService } from "./requests.service";
import {
  createRequestSchema,
  updateRequestSchema,
  requestIdParamSchema,
  requestsByCollectionSchema,
  executeRequestSchema,
} from "./requests.schemas";

export class RequestController {
  private requestService: RequestService;

  constructor() {
    this.requestService = new RequestService();
  }

  getAllRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requests = await this.requestService.getAllRequests();
      res.status(200).json({
        success: true,
        data: requests,
        message: "Requests retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getRequestById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params } = requestIdParamSchema.parse({ params: req.params });
      const request = await this.requestService.getRequestById(params.requestId);

      res.status(200).json({
        success: true,
        data: request,
        message: "Request retrieved successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Request not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  getRequestsByCollectionId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params } = requestsByCollectionSchema.parse({ params: req.params });
      const requests = await this.requestService.getRequestsByCollectionId(params.collectionId);

      res.status(200).json({
        success: true,
        data: requests,
        message: "Requests retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  createRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = createRequestSchema.parse({ body: req.body });
      const newRequest = await this.requestService.createRequest(body);

      res.status(201).json({
        success: true,
        data: newRequest,
        message: "Request created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params, body } = updateRequestSchema.parse({
        params: req.params,
        body: req.body,
      });

      const updatedRequest = await this.requestService.updateRequest(params.requestId, body);

      res.status(200).json({
        success: true,
        data: updatedRequest,
        message: "Request updated successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Request not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  deleteRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params } = requestIdParamSchema.parse({ params: req.params });
      await this.requestService.deleteRequest(params.requestId);

      res.status(200).json({
        success: true,
        message: "Request deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Request not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  updateRequestSortOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params } = requestIdParamSchema.parse({ params: req.params });
      const { sortOrder } = req.body;

      if (typeof sortOrder !== 'number' || sortOrder < 0) {
        res.status(400).json({
          success: false,
          message: "Sort order must be a non-negative number",
        });
        return;
      }

      const updatedRequest = await this.requestService.updateRequestSortOrder(params.requestId, sortOrder);

      res.status(200).json({
        success: true,
        data: updatedRequest,
        message: "Request sort order updated successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Request not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  executeRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params, body } = executeRequestSchema.parse({
        params: req.params,
        body: req.body,
      });

      const result = await this.requestService.executeRequest(params.requestId, {
        url: body?.overrideUrl || body?.url,
        headers: body?.overrideHeaders || body?.headers,
        body: body?.overrideBody || body?.body,
        environmentId: body?.environmentId,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: "Request executed successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Request not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  findSimilarRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { method, url } = req.query;

      if (!method || !url || typeof method !== 'string' || typeof url !== 'string') {
        res.status(400).json({
          success: false,
          message: "Method and URL query parameters are required",
        });
        return;
      }

      const requests = await this.requestService.findSimilarRequests(method, url);

      res.status(200).json({
        success: true,
        data: requests,
        message: "Similar requests retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
