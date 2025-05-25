// src/modules/workspaces/workspaces.schemas.ts
import z from "zod";

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(255),
    description: z.string().max(1000).optional(),
  }),
})

export type CreateWorkspaceInput = z.infer<
  typeof createWorkspaceSchema
>["body"];

export const updateWorkspaceSchema = z.object({
  params: z.object({
    workspaceId: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1, "Name is required").max(255),
    description: z.string().max(1000).optional(),
  }),
})

export type UpdateWorkspaceBody = z.infer<
  typeof updateWorkspaceSchema
>["body"];

export type UpdateWorkspaceParams = z.infer<
  typeof updateWorkspaceSchema
>["params"];

export const workspaceIdParamSchema = z.object({
  params: z.object({
    workspaceId: z.string().uuid(),
  }),
});

export type WorkspaceIdParams = z.infer<
  typeof workspaceIdParamSchema
>["params"];
