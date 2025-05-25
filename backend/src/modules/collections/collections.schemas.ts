// src/modules/collections/collections.schemas.ts
import { z } from "zod";

export const createCollectionSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(255),
    description: z.string().max(1000).optional(),
    workspaceId: z.string().uuid().optional().nullable(),
  }),
});
export type CreateCollectionInput = z.infer<
  typeof createCollectionSchema
>["body"];

export const updateCollectionSchema = z.object({
  params: z.object({
    collectionId: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional().nullable(),
    workspaceId: z.string().uuid().optional().nullable(),
  }),
});
export type UpdateCollectionBody = z.infer<
  typeof updateCollectionSchema
>["body"];
export type UpdateCollectionParams = z.infer<
  typeof updateCollectionSchema
>["params"];

export const collectionIdParamSchema = z.object({
  params: z.object({
    collectionId: z.string().uuid(),
  }),
});
export type CollectionIdParams = z.infer<
  typeof collectionIdParamSchema
>["params"];

export const collectionsByWorkspaceSchema = z.object({
  params: z.object({
    workspaceId: z.string().uuid(),
  }),
});

export type CollectionsByWorkspaceParams = z.infer<typeof collectionsByWorkspaceSchema>["params"];
