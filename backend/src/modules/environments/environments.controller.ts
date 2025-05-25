import { Request, Response, NextFunction } from "express";
import { EnvironmentService } from "./environments.service";
import {
  createEnvironmentSchema,
  updateEnvironmentSchema,
  environmentIdParamSchema,
  environmentsByWorkspaceSchema,
  activateEnvironmentSchema,
  environmentVariableSchema,
} from "./environments.schemas";

export class EnvironmentController {
  private environmentService: EnvironmentService;

  constructor() {
    this.environmentService = new EnvironmentService();
  }

  getAllEnvironments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const environments = await this.environmentService.getAllEnvironments();
      res.status(200).json({
        success: true,
        data: environments,
        message: "Environments retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getEnvironmentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params } = environmentIdParamSchema.parse({ params: req.params });
      const environment = await this.environmentService.getEnvironmentById(params.environmentId);

      res.status(200).json({
        success: true,
        data: environment,
        message: "Environment retrieved successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Environment not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  getEnvironmentsByWorkspaceId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params } = environmentsByWorkspaceSchema.parse({ params: req.params });
      const environments = await this.environmentService.getEnvironmentsByWorkspaceId(params.workspaceId);

      res.status(200).json({
        success: true,
        data: environments,
        message: "Environments retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getActiveEnvironmentByWorkspaceId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params } = environmentsByWorkspaceSchema.parse({ params: req.params });
      const environment = await this.environmentService.getActiveEnvironmentByWorkspaceId(params.workspaceId);

      if (!environment) {
        res.status(404).json({
          success: false,
          message: "No active environment found for this workspace",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: environment,
        message: "Active environment retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  createEnvironment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = createEnvironmentSchema.parse({ body: req.body });
      const newEnvironment = await this.environmentService.createEnvironment(body);

      res.status(201).json({
        success: true,
        data: newEnvironment,
        message: "Environment created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  updateEnvironment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params, body } = updateEnvironmentSchema.parse({
        params: req.params,
        body: req.body,
      });

      const updatedEnvironment = await this.environmentService.updateEnvironment(params.environmentId, body);

      res.status(200).json({
        success: true,
        data: updatedEnvironment,
        message: "Environment updated successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Environment not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  deleteEnvironment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params } = environmentIdParamSchema.parse({ params: req.params });
      await this.environmentService.deleteEnvironment(params.environmentId);

      res.status(200).json({
        success: true,
        message: "Environment deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Environment not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  activateEnvironment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params, body } = activateEnvironmentSchema.parse({
        params: req.params,
        body: req.body,
      });

      const activatedEnvironment = await this.environmentService.activateEnvironment(
        params.environmentId,
        body?.workspaceId
      );

      res.status(200).json({
        success: true,
        data: activatedEnvironment,
        message: "Environment activated successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Environment not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  deactivateEnvironment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params } = environmentIdParamSchema.parse({ params: req.params });
      const deactivatedEnvironment = await this.environmentService.deactivateEnvironment(params.environmentId);

      res.status(200).json({
        success: true,
        data: deactivatedEnvironment,
        message: "Environment deactivated successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Environment not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  updateEnvironmentVariable = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params, body } = environmentVariableSchema.parse({
        params: req.params,
        body: req.body,
      });

      const updatedEnvironment = await this.environmentService.updateEnvironmentVariable(
        params.environmentId,
        body.key,
        body.value
      );

      res.status(200).json({
        success: true,
        data: updatedEnvironment,
        message: "Environment variable updated successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Environment not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  removeEnvironmentVariable = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params } = environmentIdParamSchema.parse({ params: req.params });

      if (!req.body || !req.body.key || typeof req.body.key !== 'string') {
        res.status(400).json({
          success: false,
          message: "Variable key is required",
        });
        return;
      }

      const { key } = req.body;

      const updatedEnvironment = await this.environmentService.removeEnvironmentVariable(
        params.environmentId,
        key
      );

      res.status(200).json({
        success: true,
        data: updatedEnvironment,
        message: "Environment variable removed successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Environment not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  };

  resolveVariables = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { params } = environmentIdParamSchema.parse({ params: req.params });
      const { text } = req.body;

      if (!text || typeof text !== 'string') {
        res.status(400).json({
          success: false,
          message: "Text to resolve is required",
        });
        return;
      }

      const resolvedText = await this.environmentService.resolveVariables(params.environmentId, text);

      res.status(200).json({
        success: true,
        data: { resolvedText },
        message: "Variables resolved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
