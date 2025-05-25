// src/modules/workspaces/workspaces.routes.ts
import { Router } from "express";
import { WorkspaceController } from "./workspaces.controller";
import { validate } from '../../middleware/validationMiddleware'
import { CreateWorkspaceInput, createWorkspaceSchema, UpdateWorkspaceBody, updateWorkspaceSchema, WorkspaceIdParams, workspaceIdParamSchema } from "./workspaces.schemas";

export const workspacesRouter = Router();

const controller = new WorkspaceController();

workspacesRouter.post("/", validate(createWorkspaceSchema), (req, res, next) => controller.createWorkspaceHandler(req, res, next));
workspacesRouter.get("/", (req, res, next) => controller.getAllWorkspacesHandler(req, res, next));
workspacesRouter.get("/:workspaceId", validate(workspaceIdParamSchema), (req, res, next) => controller.getWorkspaceByIdHandler(req, res, next));
workspacesRouter.put("/:workspaceId", validate(updateWorkspaceSchema), (req, res, next) => controller.updateWorkspaceHandler(req, res, next));
workspacesRouter.delete("/:workspaceId", validate(workspaceIdParamSchema), (req, res, next) => controller.deleteWorkspaceHandler(req, res, next));

export const workspacesRoutes = workspacesRouter;
