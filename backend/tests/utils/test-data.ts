export interface TestWorkspace {
  name: string;
  description?: string;
}

export interface TestCollection {
  workspaceId?: string;
  name: string;
  description?: string;
}

export interface TestRequest {
  collectionId?: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  url: string;
  headers?: Record<string, string>;
  bodyType?: "none" | "json" | "form-data" | "x-www-form-urlencoded" | "raw" | "binary";
  bodyContent?: string;
  queryParams?: Record<string, string>;
  authType?: "none" | "bearer" | "basic" | "api-key" | "oauth2";
  authDetails?: Record<string, any>;
  preRequestScript?: string;
  postRequestScript?: string;
  sortOrder?: number;
  status: number;
  description?: string;
}

export interface TestEnvironment {
  workspaceId?: string;
  name: string;
  variables?: Record<string, string>;
  isActive?: boolean;
}

export interface TestRequestHistory {
  sourceRequestId?: string;
  method: string;
  url: string;
  requestHeaders?: Record<string, string>;
  requestBodyType?: string;
  requestBodyContent?: string;
  responseStatusCode?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
  durationMs?: number;
  collectionId?: string;
  workspaceId?: string;
}

export class TestDataFactory {
  static createWorkspace(overrides: Partial<TestWorkspace> = {}): TestWorkspace {
    return {
      name: `Test Workspace ${Date.now()}`,
      description: "A test workspace for API testing",
      ...overrides,
    };
  }

  static createCollection(overrides: Partial<TestCollection> = {}): TestCollection {
    return {
      name: `Test Collection ${Date.now()}`,
      description: "A test collection for API testing",
      ...overrides,
    };
  }

  static createRequest(overrides: Partial<TestRequest> = {}): TestRequest {
    return {
      name: `Test Request ${Date.now()}`,
      method: "GET",
      url: "https://jsonplaceholder.typicode.com/posts/1",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "ZecretlyClient/1.0.0",
      },
      bodyType: "none",
      queryParams: {},
      authType: "none",
      description: "A test request for API testing",
      sortOrder: 1,
      status: 200,
      ...overrides,
    };
  }

  static createPostRequest(overrides: Partial<TestRequest> = {}): TestRequest {
    return this.createRequest({
      method: "POST",
      url: "https://jsonplaceholder.typicode.com/posts",
      bodyType: "json",
      bodyContent: JSON.stringify({
        title: "Test Post",
        body: "This is a test post",
        userId: 1,
      }),
      ...overrides,
    });
  }

  static createEnvironment(overrides: Partial<TestEnvironment> = {}): TestEnvironment {
    return {
      name: `Test Environment ${Date.now()}`,
      variables: {
        BASE_URL: "https://api.example.com",
        API_KEY: "test-api-key-123",
        VERSION: "v1",
      },
      isActive: false,
      ...overrides,
    };
  }

  static createRequestHistory(overrides: Partial<TestRequestHistory> = {}): TestRequestHistory {
    return {
      method: "GET",
      url: "https://jsonplaceholder.typicode.com/posts/1",
      requestHeaders: {
        "Content-Type": "application/json",
        "User-Agent": "ZecretlyClient/1.0.0",
      },
      requestBodyType: "none",
      responseStatusCode: 200,
      responseHeaders: {
        "Content-Type": "application/json; charset=utf-8",
      },
      responseBody: JSON.stringify({
        id: 1,
        title: "Test Post",
        body: "This is a test response",
        userId: 1,
      }),
      durationMs: 150,
      ...overrides,
    };
  }

  // Helper methods for creating related test data
  static createWorkspaceWithCollections(collectionCount = 2) {
    const workspace = this.createWorkspace();
    const collections = Array.from({ length: collectionCount }, (_, i) =>
      this.createCollection({ name: `Collection ${i + 1}` })
    );
    return { workspace, collections };
  }

  static createCollectionWithRequests(requestCount = 3) {
    const collection = this.createCollection();
    const requests = Array.from({ length: requestCount }, (_, i) =>
      this.createRequest({
        name: `Request ${i + 1}`,
        sortOrder: i + 1,
      })
    );
    return { collection, requests };
  }

  static createRequestWithVariables() {
    return this.createRequest({
      url: "{{BASE_URL}}/api/{{VERSION}}/users",
      headers: {
        "Authorization": "Bearer {{API_KEY}}",
        "Content-Type": "application/json",
      },
    });
  }
}
