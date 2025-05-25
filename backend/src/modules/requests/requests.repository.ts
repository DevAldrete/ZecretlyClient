import { db } from "../../db/index";
import { requestsTable, collectionsTable } from "../../db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { CreateRequestInput, UpdateRequestBody } from "./requests.schemas";
import { randomUUID } from "crypto";

export class RequestRepository {
  async findAll() {
    return db
      .select({
        id: requestsTable.id,
        collectionId: requestsTable.collectionId,
        name: requestsTable.name,
        method: requestsTable.method,
        url: requestsTable.url,
        headers: requestsTable.headers,
        bodyType: requestsTable.bodyType,
        bodyContent: requestsTable.bodyContent,
        response: requestsTable.response,
        queryParams: requestsTable.queryParams,
        authType: requestsTable.authType,
        authDetails: requestsTable.authDetails,
        preRequestScript: requestsTable.preRequestScript,
        postRequestScript: requestsTable.postRequestScript,
        sortOrder: requestsTable.sortOrder,
        status: requestsTable.status,
        description: requestsTable.description,
        createdAt: requestsTable.createdAt,
        updatedAt: requestsTable.updatedAt,
        collectionName: collectionsTable.name,
      })
      .from(requestsTable)
      .leftJoin(collectionsTable, eq(requestsTable.collectionId, collectionsTable.id))
      .orderBy(asc(requestsTable.sortOrder), asc(requestsTable.name));
  }

  async findById(id: string) {
    const result = await db
      .select({
        id: requestsTable.id,
        collectionId: requestsTable.collectionId,
        name: requestsTable.name,
        method: requestsTable.method,
        url: requestsTable.url,
        headers: requestsTable.headers,
        bodyType: requestsTable.bodyType,
        bodyContent: requestsTable.bodyContent,
        response: requestsTable.response,
        queryParams: requestsTable.queryParams,
        authType: requestsTable.authType,
        authDetails: requestsTable.authDetails,
        preRequestScript: requestsTable.preRequestScript,
        postRequestScript: requestsTable.postRequestScript,
        sortOrder: requestsTable.sortOrder,
        status: requestsTable.status,
        description: requestsTable.description,
        createdAt: requestsTable.createdAt,
        updatedAt: requestsTable.updatedAt,
        collectionName: collectionsTable.name,
      })
      .from(requestsTable)
      .leftJoin(collectionsTable, eq(requestsTable.collectionId, collectionsTable.id))
      .where(eq(requestsTable.id, id));

    return result[0] || null;
  }

  async findByCollectionId(collectionId: string) {
    return db
      .select()
      .from(requestsTable)
      .where(eq(requestsTable.collectionId, collectionId))
      .orderBy(asc(requestsTable.sortOrder), asc(requestsTable.name));
  }

  async create(data: CreateRequestInput) {
    const [newRequest] = await db
      .insert(requestsTable)
      .values({
        id: randomUUID(),
        ...data,
      })
      .returning();
    return newRequest;
  }

  async update(id: string, data: UpdateRequestBody) {
    const [updatedRequest] = await db
      .update(requestsTable)
      .set(data)
      .where(eq(requestsTable.id, id))
      .returning();
    return updatedRequest;
  }

  async deleteById(id: string) {
    const [deletedRequest] = await db
      .delete(requestsTable)
      .where(eq(requestsTable.id, id))
      .returning();
    return deletedRequest;
  }

  async deleteByCollectionId(collectionId: string) {
    return db
      .delete(requestsTable)
      .where(eq(requestsTable.collectionId, collectionId))
      .returning();
  }

  async updateSortOrder(id: string, sortOrder: number) {
    const [updatedRequest] = await db
      .update(requestsTable)
      .set({ sortOrder })
      .where(eq(requestsTable.id, id))
      .returning();
    return updatedRequest;
  }

  async findByMethodAndUrl(method: string, url: string) {
    return db
      .select()
      .from(requestsTable)
      .where(and(
        eq(requestsTable.method, method),
        eq(requestsTable.url, url)
      ))
      .orderBy(desc(requestsTable.updatedAt));
  }
}
