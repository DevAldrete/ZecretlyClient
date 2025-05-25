// src/modules/collections/collections.repository.ts
import { db } from "../../db/index"
import { collectionsTable, workspacesTable } from "../../db/schema";
import { eq, asc, and, isNull } from "drizzle-orm";
import { CreateCollectionInput, UpdateCollectionBody } from "./collections.schemas";
import { randomUUID } from "crypto";

export class CollectionRepository {
  async findAll() {
    return db
      .select({
        id: collectionsTable.id,
        workspaceId: collectionsTable.workspaceId,
        name: collectionsTable.name,
        description: collectionsTable.description,
        createdAt: collectionsTable.createdAt,
        updatedAt: collectionsTable.updatedAt,
        workspaceName: workspacesTable.name,
      })
      .from(collectionsTable)
      .leftJoin(workspacesTable, eq(collectionsTable.workspaceId, workspacesTable.id))
      .orderBy(asc(collectionsTable.name));
  }

  async findById(id: string) {
    const result = await db
      .select({
        id: collectionsTable.id,
        workspaceId: collectionsTable.workspaceId,
        name: collectionsTable.name,
        description: collectionsTable.description,
        createdAt: collectionsTable.createdAt,
        updatedAt: collectionsTable.updatedAt,
        workspaceName: workspacesTable.name,
      })
      .from(collectionsTable)
      .leftJoin(workspacesTable, eq(collectionsTable.workspaceId, workspacesTable.id))
      .where(eq(collectionsTable.id, id));

    return result[0] || null;
  }

  async findByWorkspaceId(workspaceId: string) {
    return db
      .select()
      .from(collectionsTable)
      .where(eq(collectionsTable.workspaceId, workspaceId))
      .orderBy(asc(collectionsTable.name));
  }

  async findByWorkspaceIdWithDetails(workspaceId: string) {
    return db
      .select({
        id: collectionsTable.id,
        workspaceId: collectionsTable.workspaceId,
        name: collectionsTable.name,
        description: collectionsTable.description,
        createdAt: collectionsTable.createdAt,
        updatedAt: collectionsTable.updatedAt,
        workspaceName: workspacesTable.name,
      })
      .from(collectionsTable)
      .leftJoin(workspacesTable, eq(collectionsTable.workspaceId, workspacesTable.id))
      .where(eq(collectionsTable.workspaceId, workspaceId))
      .orderBy(asc(collectionsTable.name));
  }

  async findOrphanedCollections() {
    return db
      .select()
      .from(collectionsTable)
      .where(isNull(collectionsTable.workspaceId))
      .orderBy(asc(collectionsTable.name));
  }

  async create(data: CreateCollectionInput) {
    const [newCollection] = await db
      .insert(collectionsTable)
      .values({
        id: randomUUID(),
        name: data.name,
        description: data.description,
        workspaceId: data.workspaceId,
      })
      .returning();
    return newCollection;
  }

  async update(id: string, data: UpdateCollectionBody) {
    // Filter out undefined values to avoid overwriting with null
    const updateData: Partial<typeof collectionsTable.$inferInsert> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.workspaceId !== undefined) updateData.workspaceId = data.workspaceId;

    // If nothing to update, return current record
    if (Object.keys(updateData).length === 0) {
      return this.findById(id);
    }

    const [updatedCollection] = await db
      .update(collectionsTable)
      .set(updateData)
      .where(eq(collectionsTable.id, id))
      .returning();

    return updatedCollection;
  }

  async deleteById(id: string) {
    const [deletedCollection] = await db
      .delete(collectionsTable)
      .where(eq(collectionsTable.id, id))
      .returning();
    return deletedCollection;
  }

  async deleteByWorkspaceId(workspaceId: string) {
    return db
      .delete(collectionsTable)
      .where(eq(collectionsTable.workspaceId, workspaceId))
      .returning();
  }

  async findByNameAndWorkspace(name: string, workspaceId?: string | null) {
    const conditions = [eq(collectionsTable.name, name)];

    if (workspaceId === null) {
      conditions.push(isNull(collectionsTable.workspaceId));
    } else if (workspaceId !== undefined) {
      conditions.push(eq(collectionsTable.workspaceId, workspaceId));
    }

    const result = await db
      .select()
      .from(collectionsTable)
      .where(and(...conditions));

    return result[0] || null;
  }

  async countByWorkspaceId(workspaceId: string) {
    const result = await db
      .select({ count: collectionsTable.id })
      .from(collectionsTable)
      .where(eq(collectionsTable.workspaceId, workspaceId));

    return result.length;
  }

  async exists(id: string): Promise<boolean> {
    const result = await db
      .select({ id: collectionsTable.id })
      .from(collectionsTable)
      .where(eq(collectionsTable.id, id))
      .limit(1);

    return result.length > 0;
  }
}
