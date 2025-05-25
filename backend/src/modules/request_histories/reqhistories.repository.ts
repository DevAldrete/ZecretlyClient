import { db } from "../../db/index";
import { requestHistoryTable, requestsTable, collectionsTable, workspacesTable } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import { CreateRequestHistoryInput, UpdateRequestHistoryBody } from "./reqhistories.schemas";
import { randomUUID } from "crypto";

export class RequestHistoryRepository {
  async findAll() {
    return db
      .select({
        id: requestHistoryTable.id,
        sourceRequestId: requestHistoryTable.sourceRequestId,
        method: requestHistoryTable.method,
        url: requestHistoryTable.url,
        requestHeaders: requestHistoryTable.requestHeaders,
        requestBodyType: requestHistoryTable.requestBodyType,
        requestBodyContent: requestHistoryTable.requestBodyContent,
        responseStatusCode: requestHistoryTable.responseStatusCode,
        responseHeaders: requestHistoryTable.responseHeaders,
        responseBody: requestHistoryTable.responseBody,
        durationMs: requestHistoryTable.durationMs,
        executedAt: requestHistoryTable.executedAt,
        collectionId: requestHistoryTable.collectionId,
        workspaceId: requestHistoryTable.workspaceId,
        requestName: requestsTable.name,
        collectionName: collectionsTable.name,
        workspaceName: workspacesTable.name,
      })
      .from(requestHistoryTable)
      .leftJoin(requestsTable, eq(requestHistoryTable.sourceRequestId, requestsTable.id))
      .leftJoin(collectionsTable, eq(requestHistoryTable.collectionId, collectionsTable.id))
      .leftJoin(workspacesTable, eq(requestHistoryTable.workspaceId, workspacesTable.id))
      .orderBy(desc(requestHistoryTable.executedAt))
      .limit(50);
  }

  async findById(id: string) {
    const result = await db
      .select({
        id: requestHistoryTable.id,
        sourceRequestId: requestHistoryTable.sourceRequestId,
        method: requestHistoryTable.method,
        url: requestHistoryTable.url,
        requestHeaders: requestHistoryTable.requestHeaders,
        requestBodyType: requestHistoryTable.requestBodyType,
        requestBodyContent: requestHistoryTable.requestBodyContent,
        responseStatusCode: requestHistoryTable.responseStatusCode,
        responseHeaders: requestHistoryTable.responseHeaders,
        responseBody: requestHistoryTable.responseBody,
        durationMs: requestHistoryTable.durationMs,
        executedAt: requestHistoryTable.executedAt,
        collectionId: requestHistoryTable.collectionId,
        workspaceId: requestHistoryTable.workspaceId,
        requestName: requestsTable.name,
        collectionName: collectionsTable.name,
        workspaceName: workspacesTable.name,
      })
      .from(requestHistoryTable)
      .leftJoin(requestsTable, eq(requestHistoryTable.sourceRequestId, requestsTable.id))
      .leftJoin(collectionsTable, eq(requestHistoryTable.collectionId, collectionsTable.id))
      .leftJoin(workspacesTable, eq(requestHistoryTable.workspaceId, workspacesTable.id))
      .where(eq(requestHistoryTable.id, id));

    return result[0] || null;
  }

  async findByRequestId(requestId: string) {
    return db
      .select()
      .from(requestHistoryTable)
      .where(eq(requestHistoryTable.sourceRequestId, requestId))
      .orderBy(desc(requestHistoryTable.executedAt))
      .limit(20);
  }

  async findByCollectionId(collectionId: string) {
    return db
      .select()
      .from(requestHistoryTable)
      .where(eq(requestHistoryTable.collectionId, collectionId))
      .orderBy(desc(requestHistoryTable.executedAt))
      .limit(50);
  }

  async findByWorkspaceId(workspaceId: string) {
    return db
      .select()
      .from(requestHistoryTable)
      .where(eq(requestHistoryTable.workspaceId, workspaceId))
      .orderBy(desc(requestHistoryTable.executedAt))
      .limit(50);
  }

  async create(data: CreateRequestHistoryInput) {
    const [newHistory] = await db
      .insert(requestHistoryTable)
      .values({
        id: randomUUID(),
        ...data,
      })
      .returning();
    return newHistory;
  }

  async update(id: string, data: UpdateRequestHistoryBody) {
    const [updatedHistory] = await db
      .update(requestHistoryTable)
      .set(data)
      .where(eq(requestHistoryTable.id, id))
      .returning();
    return updatedHistory;
  }

  async deleteById(id: string) {
    const [deletedHistory] = await db
      .delete(requestHistoryTable)
      .where(eq(requestHistoryTable.id, id))
      .returning();
    return deletedHistory;
  }

  async deleteByRequestId(requestId: string) {
    return db
      .delete(requestHistoryTable)
      .where(eq(requestHistoryTable.sourceRequestId, requestId))
      .returning();
  }

  async deleteByCollectionId(collectionId: string) {
    return db
      .delete(requestHistoryTable)
      .where(eq(requestHistoryTable.collectionId, collectionId))
      .returning();
  }

  async deleteByWorkspaceId(workspaceId: string) {
    return db
      .delete(requestHistoryTable)
      .where(eq(requestHistoryTable.workspaceId, workspaceId))
      .returning();
  }
}
