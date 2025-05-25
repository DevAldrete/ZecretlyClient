// src/db/schema.ts

// Import necessary modules from drizzle-orm
import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

// A minimal workspaces table for the foreign key relationship
export const workspacesTable = pgTable("zecretly_workspaces", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()) // Automatically update on modification
    .notNull(),
});

// collections

export const collectionsTable = pgTable("zecretly_collections", {
  id: uuid("id").primaryKey(),
  // workspaceId can be null if a collection doesn't belong to any workspace
  // or if workspaces are a future feature.
  // For a strict relation, make it .notNull() and ensure a workspace is always linked.
  workspaceId: uuid("workspace_id").references(() => workspacesTable.id),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// requests

export const requestsTable = pgTable("zecretly_requests", {
  id: uuid("id").primaryKey(),
  collectionId: uuid("collection_id").references(() => collectionsTable.id),
  name: text("name").notNull(),
  method: text("method").notNull(),
  url: text("url").notNull(),
  headers: jsonb("headers"),
  bodyType: text("body_type"),
  bodyContent: text("body_content"),
  response: text("response"),
  queryParams: jsonb("query_params"),
  authType: text("auth_type"),
  authDetails: jsonb("auth_details"),
  preRequestScript: text("pre_request_script"),
  postRequestScript: text("post_request_script"),
  sortOrder: integer("sort_order").default(0),
  status: integer("status").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// environments

export const environmentsTable = pgTable("zecretly_environments", {
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id").references(() => workspacesTable.id),
  name: text("name").notNull(),
  variables: jsonb("variables"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});


// request_history

export const requestHistoryTable = pgTable("zecretly_request_history", {
  id: uuid("id").primaryKey(),
  sourceRequestId: uuid("source_request_id").references(() => requestsTable.id),
  method: text("method").notNull(),
  url: text("url").notNull(),
  requestHeaders: jsonb("request_headers"),
  requestBodyType: text("request_body_type"),
  requestBodyContent: text("request_body_content"),
  responseStatusCode: integer("response_status_code"),
  responseHeaders: jsonb("response_headers"),
  responseBody: text("response_body"),
  durationMs: integer("duration_ms"),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
  collectionId: uuid("collection_id").references(() => collectionsTable.id),
  workspaceId: uuid("workspace_id").references(() => workspacesTable.id),
});
