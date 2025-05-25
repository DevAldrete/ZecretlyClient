import { db } from "../../db/index";
import { environmentsTable, workspacesTable } from "../../db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { CreateEnvironmentInput, UpdateEnvironmentBody } from "./environments.schemas";
import { randomUUID } from "crypto";

export class EnvironmentRepository {
  async findAll() {
    return db
      .select({
        id: environmentsTable.id,
        workspaceId: environmentsTable.workspaceId,
        name: environmentsTable.name,
        variables: environmentsTable.variables,
        isActive: environmentsTable.isActive,
        createdAt: environmentsTable.createdAt,
        updatedAt: environmentsTable.updatedAt,
        workspaceName: workspacesTable.name,
      })
      .from(environmentsTable)
      .leftJoin(workspacesTable, eq(environmentsTable.workspaceId, workspacesTable.id))
      .orderBy(asc(environmentsTable.name));
  }

  async findById(id: string) {
    const result = await db
      .select({
        id: environmentsTable.id,
        workspaceId: environmentsTable.workspaceId,
        name: environmentsTable.name,
        variables: environmentsTable.variables,
        isActive: environmentsTable.isActive,
        createdAt: environmentsTable.createdAt,
        updatedAt: environmentsTable.updatedAt,
        workspaceName: workspacesTable.name,
      })
      .from(environmentsTable)
      .leftJoin(workspacesTable, eq(environmentsTable.workspaceId, workspacesTable.id))
      .where(eq(environmentsTable.id, id));

    return result[0] || null;
  }

  async findByWorkspaceId(workspaceId: string) {
    return db
      .select()
      .from(environmentsTable)
      .where(eq(environmentsTable.workspaceId, workspaceId))
      .orderBy(desc(environmentsTable.isActive), asc(environmentsTable.name));
  }

  async findActiveByWorkspaceId(workspaceId: string) {
    const result = await db
      .select()
      .from(environmentsTable)
      .where(and(
        eq(environmentsTable.workspaceId, workspaceId),
        eq(environmentsTable.isActive, true)
      ));

    return result[0] || null;
  }

  async create(data: CreateEnvironmentInput) {
    const [newEnvironment] = await db
      .insert(environmentsTable)
      .values({
        id: randomUUID(),
        ...data,
      })
      .returning();
    return newEnvironment;
  }

  async update(id: string, data: UpdateEnvironmentBody) {
    const [updatedEnvironment] = await db
      .update(environmentsTable)
      .set(data)
      .where(eq(environmentsTable.id, id))
      .returning();
    return updatedEnvironment;
  }

  async deleteById(id: string) {
    const [deletedEnvironment] = await db
      .delete(environmentsTable)
      .where(eq(environmentsTable.id, id))
      .returning();
    return deletedEnvironment;
  }

  async deleteByWorkspaceId(workspaceId: string) {
    return db
      .delete(environmentsTable)
      .where(eq(environmentsTable.workspaceId, workspaceId))
      .returning();
  }

  async activateEnvironment(id: string, workspaceId?: string) {
    // Start a transaction to ensure only one environment is active per workspace
    return db.transaction(async (tx) => {
      // First, get the environment to check its workspace
      const environment = await tx
        .select()
        .from(environmentsTable)
        .where(eq(environmentsTable.id, id));

      if (!environment[0]) {
        throw new Error("Environment not found");
      }

      const targetWorkspaceId = workspaceId || environment[0].workspaceId;

      // Deactivate all environments in the workspace
      if (targetWorkspaceId) {
        await tx
          .update(environmentsTable)
          .set({ isActive: false })
          .where(eq(environmentsTable.workspaceId, targetWorkspaceId));
      }

      // Activate the target environment
      const [activatedEnvironment] = await tx
        .update(environmentsTable)
        .set({ isActive: true })
        .where(eq(environmentsTable.id, id))
        .returning();

      return activatedEnvironment;
    });
  }

  async deactivateEnvironment(id: string) {
    const [deactivatedEnvironment] = await db
      .update(environmentsTable)
      .set({ isActive: false })
      .where(eq(environmentsTable.id, id))
      .returning();
    return deactivatedEnvironment;
  }

  async updateVariable(id: string, key: string, value: string) {
    // Get current variables
    const environment = await this.findById(id);
    if (!environment) {
      throw new Error("Environment not found");
    }

    const currentVariables = environment.variables || {};
    const updatedVariables = {
      ...currentVariables,
      [key]: value,
    };

    const [updatedEnvironment] = await db
      .update(environmentsTable)
      .set({ variables: updatedVariables })
      .where(eq(environmentsTable.id, id))
      .returning();

    return updatedEnvironment;
  }

  async removeVariable(id: string, key: string) {
    // Get current variables
    const environment = await this.findById(id);
    if (!environment) {
      throw new Error("Environment not found");
    }

    const currentVariables = (environment.variables as Record<string, string>) || {};
    const { [key]: removed, ...updatedVariables } = currentVariables;

    const [updatedEnvironment] = await db
      .update(environmentsTable)
      .set({ variables: updatedVariables })
      .where(eq(environmentsTable.id, id))
      .returning();

    return updatedEnvironment;
  }
}
