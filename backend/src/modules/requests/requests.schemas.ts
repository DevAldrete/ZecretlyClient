import z from "zod";

// HTTP methods enum
const httpMethodSchema = z.enum([
  "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"
]);

// Body types enum
const bodyTypeSchema = z.enum([
  "none", "json", "form-data", "x-www-form-urlencoded", "raw", "binary"
]);

// Auth types enum
const authTypeSchema = z.enum([
  "none", "bearer", "basic", "api-key", "oauth2"
]);

// Custom URL validator that allows template variables
const urlWithVariablesSchema = z.string().refine((url) => {
  // If the URL contains template variables, temporarily replace them for validation
  const urlWithoutVariables = url.replace(/\{\{[^}]+\}\}/g, 'placeholder');

  // Check if it's a valid URL after replacing variables
  try {
    new URL(urlWithoutVariables);
    return true;
  } catch {
    // If it's not a valid URL, check if it's a relative path with variables
    // Allow relative paths that start with / or contain variables
    return url.startsWith('/') || url.includes('{{');
  }
}, "Invalid URL format");

export const createRequestSchema = z.object({
  body: z.object({
    collectionId: z.string().uuid().optional(),
    name: z.string().min(1, "Name is required").max(255),
    method: httpMethodSchema,
    url: urlWithVariablesSchema,
    headers: z.record(z.string()).optional(),
    bodyType: bodyTypeSchema.optional(),
    bodyContent: z.string().optional(),
    queryParams: z.record(z.string()).optional(),
    authType: authTypeSchema.optional(),
    authDetails: z.record(z.any()).optional(),
    preRequestScript: z.string().optional(),
    postRequestScript: z.string().optional(),
    sortOrder: z.number().int().min(0).optional(),
    status: z.number().int().min(100).max(599),
    description: z.string().max(1000).optional(),
  }),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>["body"];

export const updateRequestSchema = z.object({
  params: z.object({
    requestId: z.string().uuid(),
  }),
  body: z.object({
    collectionId: z.string().uuid().optional(),
    name: z.string().min(1, "Name is required").max(255).optional(),
    method: httpMethodSchema.optional(),
    url: urlWithVariablesSchema.optional(),
    headers: z.record(z.string()).optional(),
    bodyType: bodyTypeSchema.optional(),
    bodyContent: z.string().optional(),
    response: z.string().optional(),
    queryParams: z.record(z.string()).optional(),
    authType: authTypeSchema.optional(),
    authDetails: z.record(z.any()).optional(),
    preRequestScript: z.string().optional(),
    postRequestScript: z.string().optional(),
    sortOrder: z.number().int().min(0).optional(),
    status: z.number().int().min(100).max(599).optional(),
    description: z.string().max(1000).optional(),
  }),
});

export type UpdateRequestBody = z.infer<typeof updateRequestSchema>["body"];
export type UpdateRequestParams = z.infer<typeof updateRequestSchema>["params"];

export const requestIdParamSchema = z.object({
  params: z.object({
    requestId: z.string().uuid(),
  }),
});

export type RequestIdParams = z.infer<typeof requestIdParamSchema>["params"];

export const requestsByCollectionSchema = z.object({
  params: z.object({
    collectionId: z.string().uuid(),
  }),
});

export type RequestsByCollectionParams = z.infer<typeof requestsByCollectionSchema>["params"];

export const executeRequestSchema = z.object({
  params: z.object({
    requestId: z.string().uuid(),
  }),
  body: z.object({
    environmentId: z.string().uuid().optional(),
    overrideUrl: urlWithVariablesSchema.optional(),
    overrideHeaders: z.record(z.string()).optional(),
    overrideBody: z.string().optional(),
    // Also accept the shorter format for convenience
    url: urlWithVariablesSchema.optional(),
    headers: z.record(z.string()).optional(),
    body: z.string().optional(),
  }).optional(),
});

export type ExecuteRequestParams = z.infer<typeof executeRequestSchema>["params"];
export type ExecuteRequestBody = z.infer<typeof executeRequestSchema>["body"];
