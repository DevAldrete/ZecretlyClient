import { Router } from "express";
import { RequestHistoryController } from "./reqhistories.controller";

const router = Router();
const requestHistoryController = new RequestHistoryController();

// GET /api/request-histories - Get all request histories
router.get("/", requestHistoryController.getAllRequestHistories);

// GET /api/request-histories/:historyId - Get request history by ID
router.get("/:historyId", requestHistoryController.getRequestHistoryById);

// POST /api/request-histories - Create new request history
router.post("/", requestHistoryController.createRequestHistory);

// PUT /api/request-histories/:historyId - Update request history
router.put("/:historyId", requestHistoryController.updateRequestHistory);

// DELETE /api/request-histories/:historyId - Delete request history
router.delete("/:historyId", requestHistoryController.deleteRequestHistory);

// GET /api/request-histories/request/:requestId - Get histories by request ID
router.get("/request/:requestId", requestHistoryController.getRequestHistoriesByRequestId);

// GET /api/request-histories/collection/:collectionId - Get histories by collection ID
router.get("/collection/:collectionId", requestHistoryController.getRequestHistoriesByCollectionId);

// GET /api/request-histories/workspace/:workspaceId - Get histories by workspace ID
router.get("/workspace/:workspaceId", requestHistoryController.getRequestHistoriesByWorkspaceId);

export { router as requestHistoriesRoutes };
