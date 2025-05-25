import z from "zod";

export const createRequestHistorySchema = z.object({
  body: z.object({
    sourceRequestId: z.string().uuid().optional(),
    method: z.string().min(1, "Method is required"),
    url: z.string().url("Invalid URL format"),
    requestHeaders: z.record(z.string()).optional(),
    requestBodyType: z.string().optional(),
    requestBodyContent: z.string().optional(),
    responseStatusCode: z.number().int().min(100).max(599).optional(),
    responseHeaders: z.record(z.string()).optional(),
    responseBody: z.string().optional(),
    durationMs: z.number().int().min(0).optional(),
    collectionId: z.string().uuid().optional(),
    workspaceId: z.string().uuid().optional(),
  }),
});

export type CreateRequestHistoryInput = z.infer<typeof createRequestHistorySchema>["body"];

export const updateRequestHistorySchema = z.object({
  params: z.object({
    historyId: z.string().uuid(),
  }),
  body: z.object({
    sourceRequestId: z.string().uuid().optional(),
    method: z.string().min(1, "Method is required").optional(),
    url: z.string().url("Invalid URL format").optional(),
    requestHeaders: z.record(z.string()).optional(),
    requestBodyType: z.string().optional(),
    requestBodyContent: z.string().optional(),
    responseStatusCode: z.number().int().min(100).max(599).optional(),
    responseHeaders: z.record(z.string()).optional(),
    responseBody: z.string().optional(),
    durationMs: z.number().int().min(0).optional(),
    collectionId: z.string().uuid().optional(),
    workspaceId: z.string().uuid().optional(),
  }),
});

export type UpdateRequestHistoryBody = z.infer<typeof updateRequestHistorySchema>["body"];
export type UpdateRequestHistoryParams = z.infer<typeof updateRequestHistorySchema>["params"];

export const requestHistoryIdParamSchema = z.object({
  params: z.object({
    historyId: z.string().uuid(),
  }),
});

export type RequestHistoryIdParams = z.infer<typeof requestHistoryIdParamSchema>["params"];

export const requestHistoryByRequestSchema = z.object({
  params: z.object({
    requestId: z.string().uuid(),
  }),
});

export type RequestHistoryByRequestParams = z.infer<typeof requestHistoryByRequestSchema>["params"];

export const requestHistoryByCollectionSchema = z.object({
  params: z.object({
    collectionId: z.string().uuid(),
  }),
});

export type RequestHistoryByCollectionParams = z.infer<typeof requestHistoryByCollectionSchema>["params"];

export const requestHistoryByWorkspaceSchema = z.object({
  params: z.object({
    workspaceId: z.string().uuid(),
  }),
});

export type RequestHistoryByWorkspaceParams = z.infer<typeof requestHistoryByWorkspaceSchema>["params"];

export const requestHistoryQuerySchema = z.object({
  query: z.object({
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
    offset: z.string().transform(Number).pipe(z.number().int().min(0)).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    method: z.string().optional(),
    status: z.string().transform(Number).pipe(z.number().int().min(100).max(599)).optional(),
  }),
});

export type RequestHistoryQuery = z.infer<typeof requestHistoryQuerySchema>["query"];
