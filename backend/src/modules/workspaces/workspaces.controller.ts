// src/modules/workspaces/workspaces.controller.ts
import { Request, Response, NextFunction } from "express";
import { WorkspaceService } from "./workspaces.service";
import { CreateWorkspaceInput, UpdateWorkspaceBody, WorkspaceIdParams } from "./workspaces.schemas";

export class WorkspaceController {
  private service: WorkspaceService;

  constructor() {
    this.service = new WorkspaceService();
  }

  async createWorkspaceHandler(
    req: Request<{}, {}, CreateWorkspaceInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const workspace = await this.service.createWorkspace(req.body);
      res.status(201).json({
        success: true,
        data: workspace,
        message: "Workspace created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllWorkspacesHandler(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const workspaces = await this.service.getAllWorkspaces();
      res.status(200).json({
        success: true,
        data: workspaces,
        message: "Workspaces retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkspaceByIdHandler(
    req: Request<WorkspaceIdParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const workspace = await this.service.getWorkspaceById(req.params.workspaceId);
      res.status(200).json({
        success: true,
        data: workspace,
        message: "Workspace retrieved successfully",
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

  async updateWorkspaceHandler(
    req: Request<WorkspaceIdParams, {}, UpdateWorkspaceBody>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const workspace = await this.service.updateWorkspace(req.params.workspaceId, req.body);
      res.status(200).json({
        success: true,
        data: workspace,
        message: "Workspace updated successfully",
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


  async deleteWorkspaceHandler(
    req: Request<WorkspaceIdParams>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await this.service.deleteWorkspace(req.params.workspaceId);
      res.status(200).json({
        success: true,
        message: "Workspace deleted successfully",
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
}
