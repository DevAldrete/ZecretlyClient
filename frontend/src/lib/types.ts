// Type definitions based on backend schemas

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
  workspaceId?: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
export type BodyType = 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary';
export type AuthType = 'none' | 'bearer' | 'basic' | 'api-key' | 'oauth2';

export interface Request {
  id: string;
  collectionId?: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  bodyType?: BodyType;
  bodyContent?: string;
  response?: string;
  queryParams?: Record<string, string>;
  authType?: AuthType;
  authDetails?: Record<string, unknown>;
  preRequestScript?: string;
  postRequestScript?: string;
  sortOrder?: number;
  status: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestInput {
  collectionId?: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  bodyType?: BodyType;
  bodyContent?: string;
  queryParams?: Record<string, string>;
  authType?: AuthType;
  authDetails?: Record<string, unknown>;
  preRequestScript?: string;
  postRequestScript?: string;
  sortOrder?: number;
  status: number;
  description?: string;
}

export interface Environment {
  id: string;
  name: string;
  workspaceId?: string;
  variables: Record<string, string>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnvironmentInput {
  name: string;
  workspaceId?: string;
  variables?: Record<string, string>;
}

export interface ExecuteRequestInput {
  environmentId?: string;
  overrideUrl?: string;
  overrideHeaders?: Record<string, string>;
  overrideBody?: string;
}

export interface RequestExecution {
  id: string;
  requestId: string;
  environmentId?: string;
  executedAt: string;
  response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    duration: number;
  };
}
