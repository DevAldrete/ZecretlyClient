import { Router } from "express";
import { RequestController } from "./requests.controller";

const router = Router();
const requestController = new RequestController();

// GET /api/requests - Get all requests
router.get("/", requestController.getAllRequests);

// GET /api/requests/search - Find similar requests (must be before /:requestId)
router.get("/search", requestController.findSimilarRequests);

// GET /api/requests/:requestId - Get request by ID
router.get("/:requestId", requestController.getRequestById);

// POST /api/requests - Create new request
router.post("/", requestController.createRequest);

// PUT /api/requests/:requestId - Update request
router.put("/:requestId", requestController.updateRequest);

// DELETE /api/requests/:requestId - Delete request
router.delete("/:requestId", requestController.deleteRequest);

// PATCH /api/requests/:requestId/sort-order - Update request sort order
router.patch("/:requestId/sort-order", requestController.updateRequestSortOrder);

// POST /api/requests/:requestId/execute - Execute request
router.post("/:requestId/execute", requestController.executeRequest);

// GET /api/requests/collection/:collectionId - Get requests by collection
router.get("/collection/:collectionId", requestController.getRequestsByCollectionId);

export { router as requestsRoutes };
