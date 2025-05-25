// src/modules/workspaces/workspaces.repository.ts
import { db } from "../../db/index"
import { workspacesTable } from "../../db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { CreateWorkspaceInput, UpdateWorkspaceBody } from "./workspaces.schemas";
import { randomUUID } from "crypto";

export class WorkspaceRepository {
  async findAll() {
    return db
      .select()
      .from(workspacesTable)
      .orderBy(asc(workspacesTable.name));
  }

  async findById(id: string) {
    const result = await db
      .select()
      .from(workspacesTable)
      .where(eq(workspacesTable.id, id));

    return result[0] || null;
  }

  async create(data: CreateWorkspaceInput) {
    const [newWorkspace] = await db
      .insert(workspacesTable)
      .values({
        id: randomUUID(),
        name: data.name,
        description: data.description,
      })
      .returning();

    return newWorkspace;
  }

  async update(id: string, data: UpdateWorkspaceBody) {
    // Filter out undefined values to avoid overwriting with null
    const updateData: Partial<typeof workspacesTable.$inferInsert> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;

    // If nothing to update, return current record
    if (Object.keys(updateData).length === 0) {
      return this.findById(id);
    }

    const [updatedWorkspace] = await db
      .update(workspacesTable)
      .set(updateData)
      .where(eq(workspacesTable.id, id))
      .returning();

    return updatedWorkspace;
  }

  async deleteById(id: string) {
    const [deletedWorkspace] = await db
      .delete(workspacesTable)
      .where(eq(workspacesTable.id, id))
      .returning();

    return deletedWorkspace;
  }

  async findByName(name: string) {
    const result = await db
      .select()
      .from(workspacesTable)
      .where(eq(workspacesTable.name, name));

    return result[0] || null;
  }

  async findRecentlyUpdated(limit: number = 10) {
    return db
      .select()
      .from(workspacesTable)
      .orderBy(desc(workspacesTable.updatedAt))
      .limit(limit);
  }

  async exists(id: string): Promise<boolean> {
    const result = await db
      .select({ id: workspacesTable.id })
      .from(workspacesTable)
      .where(eq(workspacesTable.id, id))
      .limit(1);

    return result.length > 0;
  }

  async count(): Promise<number> {
    const result = await db
      .select({ count: workspacesTable.id })
      .from(workspacesTable);

    return result.length;
  }
}
