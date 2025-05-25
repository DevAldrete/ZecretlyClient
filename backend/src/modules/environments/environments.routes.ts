import { Router } from "express";
import { EnvironmentController } from "./environments.controller";

const router = Router();
const environmentController = new EnvironmentController();

// GET /api/environments - Get all environments
router.get("/", environmentController.getAllEnvironments);

// GET /api/environments/:environmentId - Get environment by ID
router.get("/:environmentId", environmentController.getEnvironmentById);

// POST /api/environments - Create new environment
router.post("/", environmentController.createEnvironment);

// PUT /api/environments/:environmentId - Update environment
router.put("/:environmentId", environmentController.updateEnvironment);

// DELETE /api/environments/:environmentId - Delete environment
router.delete("/:environmentId", environmentController.deleteEnvironment);

// POST /api/environments/:environmentId/activate - Activate environment
router.post("/:environmentId/activate", environmentController.activateEnvironment);

// POST /api/environments/:environmentId/deactivate - Deactivate environment
router.post("/:environmentId/deactivate", environmentController.deactivateEnvironment);

// PUT /api/environments/:environmentId/variables - Update environment variable
router.put("/:environmentId/variables", environmentController.updateEnvironmentVariable);

// DELETE /api/environments/:environmentId/variables - Remove environment variable
router.delete("/:environmentId/variables", environmentController.removeEnvironmentVariable);

// POST /api/environments/:environmentId/resolve - Resolve variables in text
router.post("/:environmentId/resolve", environmentController.resolveVariables);

// GET /api/environments/workspace/:workspaceId - Get environments by workspace
router.get("/workspace/:workspaceId", environmentController.getEnvironmentsByWorkspaceId);

// GET /api/environments/workspace/:workspaceId/active - Get active environment by workspace
router.get("/workspace/:workspaceId/active", environmentController.getActiveEnvironmentByWorkspaceId);

export { router as environmentsRoutes };
