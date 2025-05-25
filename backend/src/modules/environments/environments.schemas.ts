import z from "zod";

export const createEnvironmentSchema = z.object({
  body: z.object({
    workspaceId: z.string().uuid().optional(),
    name: z.string().min(1, "Name is required").max(255),
    variables: z.record(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateEnvironmentInput = z.infer<typeof createEnvironmentSchema>["body"];

export const updateEnvironmentSchema = z.object({
  params: z.object({
    environmentId: z.string().uuid(),
  }),
  body: z.object({
    workspaceId: z.string().uuid().optional(),
    name: z.string().min(1, "Name is required").max(255).optional(),
    variables: z.record(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

export type UpdateEnvironmentBody = z.infer<typeof updateEnvironmentSchema>["body"];
export type UpdateEnvironmentParams = z.infer<typeof updateEnvironmentSchema>["params"];

export const environmentIdParamSchema = z.object({
  params: z.object({
    environmentId: z.string().uuid(),
  }),
});

export type EnvironmentIdParams = z.infer<typeof environmentIdParamSchema>["params"];

export const environmentsByWorkspaceSchema = z.object({
  params: z.object({
    workspaceId: z.string().uuid(),
  }),
});

export type EnvironmentsByWorkspaceParams = z.infer<typeof environmentsByWorkspaceSchema>["params"];

export const activateEnvironmentSchema = z.object({
  params: z.object({
    environmentId: z.string().uuid(),
  }),
  body: z.object({
    workspaceId: z.string().uuid().optional(),
  }),
});

export type ActivateEnvironmentParams = z.infer<typeof activateEnvironmentSchema>["params"];
export type ActivateEnvironmentBody = z.infer<typeof activateEnvironmentSchema>["body"];

export const environmentVariableSchema = z.object({
  params: z.object({
    environmentId: z.string().uuid(),
  }),
  body: z.object({
    key: z.string().min(1, "Variable key is required"),
    value: z.string(),
  }),
});

export type EnvironmentVariableParams = z.infer<typeof environmentVariableSchema>["params"];
export type EnvironmentVariableBody = z.infer<typeof environmentVariableSchema>["body"];
