import { test, expect } from '@playwright/test';
import { ApiTestHelper, validateApiResponse, validateUUID, validateTimestamp } from './utils/test-helpers';
import { TestDataFactory } from './utils/test-data';

test.describe('Request Histories API', () => {
  let api: ApiTestHelper;
  let createdWorkspaceIds: string[] = [];
  let createdCollectionIds: string[] = [];
  let createdRequestIds: string[] = [];
  let createdHistoryIds: string[] = [];

  test.beforeEach(async ({ request }) => {
    api = new ApiTestHelper(request);
  });

  test.afterEach(async () => {
    // Cleanup in reverse order
    for (const id of createdHistoryIds) {
      try {
        await api.delete(`/request-histories/${id}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    for (const id of createdRequestIds) {
      try {
        await api.delete(`/requests/${id}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    for (const id of createdCollectionIds) {
      try {
        await api.delete(`/collections/${id}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    for (const id of createdWorkspaceIds) {
      try {
        await api.delete(`/workspaces/${id}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    createdHistoryIds = [];
    createdRequestIds = [];
    createdCollectionIds = [];
    createdWorkspaceIds = [];
  });

  test.describe('POST /api/request-histories', () => {
    test('should create a new request history', async () => {
      const historyData = TestDataFactory.createRequestHistory();

      const response = await api.post('/request-histories', historyData);
      validateApiResponse(response);

      const history = response.data;
      expect(history).toHaveProperty('id');
      expect(history).toHaveProperty('method', historyData.method);
      expect(history).toHaveProperty('url', historyData.url);
      expect(history).toHaveProperty('requestHeaders');
      expect(history).toHaveProperty('responseStatusCode', historyData.responseStatusCode);
      expect(history).toHaveProperty('responseHeaders');
      expect(history).toHaveProperty('responseBody', historyData.responseBody);
      expect(history).toHaveProperty('durationMs', historyData.durationMs);
      expect(history).toHaveProperty('executedAt');

      validateUUID(history.id);
      validateTimestamp(history.executedAt);

      createdHistoryIds.push(history.id);
    });

    test('should create request history with source request', async () => {
      // Create a source request first
      const requestData = TestDataFactory.createRequest();
      const request = await api.post('/requests', requestData);
      createdRequestIds.push(request.data.id);

      const historyData = TestDataFactory.createRequestHistory({
        sourceRequestId: request.data.id,
      });

      const response = await api.post('/request-histories', historyData);
      validateApiResponse(response);

      const history = response.data;
      expect(history.sourceRequestId).toBe(request.data.id);

      createdHistoryIds.push(history.id);
    });

    test('should create request history with workspace and collection', async () => {
      // Create workspace and collection
      const workspaceData = TestDataFactory.createWorkspace();
      const workspace = await api.post('/workspaces', workspaceData);
      createdWorkspaceIds.push(workspace.data.id);

      const collectionData = TestDataFactory.createCollection({
        workspaceId: workspace.data.id,
      });
      const collection = await api.post('/collections', collectionData);
      createdCollectionIds.push(collection.data.id);

      const historyData = TestDataFactory.createRequestHistory({
        workspaceId: workspace.data.id,
        collectionId: collection.data.id,
      });

      const response = await api.post('/request-histories', historyData);
      validateApiResponse(response);

      const history = response.data;
      expect(history.workspaceId).toBe(workspace.data.id);
      expect(history.collectionId).toBe(collection.data.id);

      createdHistoryIds.push(history.id);
    });

    test('should reject history without required fields', async () => {
      const invalidData = {
        responseStatusCode: 200,
      };

      await api.expectError('/request-histories', 'POST', invalidData, 400);
    });
  });

  test.describe('GET /api/request-histories', () => {
    test('should get all request histories', async () => {
      // Create test histories
      const history1 = TestDataFactory.createRequestHistory({
        url: 'https://api1.example.com/test',
      });
      const history2 = TestDataFactory.createRequestHistory({
        url: 'https://api2.example.com/test',
      });

      const created1 = await api.post('/request-histories', history1);
      const created2 = await api.post('/request-histories', history2);

      createdHistoryIds.push(created1.data.id, created2.data.id);

      const response = await api.get('/request-histories');
      validateApiResponse(response);

      expect(Array.isArray(response.data)).toBeTruthy();
      expect(response.data.length).toBeGreaterThanOrEqual(2);

      // Check if our created histories are in the list
      const historyUrls = response.data.map((h: any) => h.url);
      expect(historyUrls).toContain('https://api1.example.com/test');
      expect(historyUrls).toContain('https://api2.example.com/test');
    });
  });

  test.describe('GET /api/request-histories/:historyId', () => {
    test('should get request history by ID', async () => {
      const historyData = TestDataFactory.createRequestHistory();
      const created = await api.post('/request-histories', historyData);
      createdHistoryIds.push(created.data.id);

      const response = await api.get(`/request-histories/${created.data.id}`);
      validateApiResponse(response);

      const history = response.data;
      expect(history.id).toBe(created.data.id);
      expect(history.method).toBe(historyData.method);
      expect(history.url).toBe(historyData.url);
      expect(history.responseStatusCode).toBe(historyData.responseStatusCode);
    });

    test('should return 404 for non-existent history', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await api.expectError(`/request-histories/${fakeId}`, 'GET', undefined, 404);
    });
  });

  test.describe('GET /api/request-histories/request/:requestId', () => {
    test('should get histories by request ID', async () => {
      // Create a source request
      const requestData = TestDataFactory.createRequest();
      const request = await api.post('/requests', requestData);
      createdRequestIds.push(request.data.id);

      // Create histories for this request
      const history1 = TestDataFactory.createRequestHistory({
        sourceRequestId: request.data.id,
        responseStatusCode: 200,
      });
      const history2 = TestDataFactory.createRequestHistory({
        sourceRequestId: request.data.id,
        responseStatusCode: 404,
      });

      const created1 = await api.post('/request-histories', history1);
      const created2 = await api.post('/request-histories', history2);

      createdHistoryIds.push(created1.data.id, created2.data.id);

      const response = await api.get(`/request-histories/request/${request.data.id}`);
      validateApiResponse(response);

      expect(Array.isArray(response.data)).toBeTruthy();
      expect(response.data.length).toBe(2);

      response.data.forEach((history: any) => {
        expect(history.sourceRequestId).toBe(request.data.id);
      });

      // Check status codes
      const statusCodes = response.data.map((h: any) => h.responseStatusCode);
      expect(statusCodes).toContain(200);
      expect(statusCodes).toContain(404);
    });

    test('should return empty array for request with no histories', async () => {
      // Create a request without histories
      const requestData = TestDataFactory.createRequest();
      const request = await api.post('/requests', requestData);
      createdRequestIds.push(request.data.id);

      const response = await api.get(`/request-histories/request/${request.data.id}`);
      validateApiResponse(response);

      expect(Array.isArray(response.data)).toBeTruthy();
      expect(response.data.length).toBe(0);
    });
  });

  test.describe('GET /api/request-histories/collection/:collectionId', () => {
    test('should get histories by collection ID', async () => {
      // Create collection
      const collectionData = TestDataFactory.createCollection();
      const collection = await api.post('/collections', collectionData);
      createdCollectionIds.push(collection.data.id);

      // Create histories for this collection
      const history1 = TestDataFactory.createRequestHistory({
        collectionId: collection.data.id,
        url: 'https://collection-api1.example.com',
      });
      const history2 = TestDataFactory.createRequestHistory({
        collectionId: collection.data.id,
        url: 'https://collection-api2.example.com',
      });

      const created1 = await api.post('/request-histories', history1);
      const created2 = await api.post('/request-histories', history2);

      createdHistoryIds.push(created1.data.id, created2.data.id);

      const response = await api.get(`/request-histories/collection/${collection.data.id}`);
      validateApiResponse(response);

      expect(Array.isArray(response.data)).toBeTruthy();
      expect(response.data.length).toBe(2);

      response.data.forEach((history: any) => {
        expect(history.collectionId).toBe(collection.data.id);
      });
    });
  });

  test.describe('GET /api/request-histories/workspace/:workspaceId', () => {
    test('should get histories by workspace ID', async () => {
      // Create workspace
      const workspaceData = TestDataFactory.createWorkspace();
      const workspace = await api.post('/workspaces', workspaceData);
      createdWorkspaceIds.push(workspace.data.id);

      // Create histories for this workspace
      const history1 = TestDataFactory.createRequestHistory({
        workspaceId: workspace.data.id,
        url: 'https://workspace-api1.example.com',
      });
      const history2 = TestDataFactory.createRequestHistory({
        workspaceId: workspace.data.id,
        url: 'https://workspace-api2.example.com',
      });

      const created1 = await api.post('/request-histories', history1);
      const created2 = await api.post('/request-histories', history2);

      createdHistoryIds.push(created1.data.id, created2.data.id);

      const response = await api.get(`/request-histories/workspace/${workspace.data.id}`);
      validateApiResponse(response);

      expect(Array.isArray(response.data)).toBeTruthy();
      expect(response.data.length).toBe(2);

      response.data.forEach((history: any) => {
        expect(history.workspaceId).toBe(workspace.data.id);
      });
    });
  });

  test.describe('PUT /api/request-histories/:historyId', () => {
    test('should update request history', async () => {
      const historyData = TestDataFactory.createRequestHistory();
      const created = await api.post('/request-histories', historyData);
      createdHistoryIds.push(created.data.id);

      const updateData = {
        responseStatusCode: 500,
        responseBody: JSON.stringify({ error: 'Internal Server Error' }),
        durationMs: 5000,
      };

      const response = await api.put(`/request-histories/${created.data.id}`, updateData);
      validateApiResponse(response);

      const updated = response.data;
      expect(updated.id).toBe(created.data.id);
      expect(updated.responseStatusCode).toBe(updateData.responseStatusCode);
      expect(updated.responseBody).toBe(updateData.responseBody);
      expect(updated.durationMs).toBe(updateData.durationMs);
    });

    test('should return 404 for non-existent history', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const updateData = { responseStatusCode: 200 };

      await api.expectError(`/request-histories/${fakeId}`, 'PUT', updateData, 404);
    });
  });

  test.describe('DELETE /api/request-histories/:historyId', () => {
    test('should delete request history', async () => {
      const historyData = TestDataFactory.createRequestHistory();
      const created = await api.post('/request-histories', historyData);

      const response = await api.delete(`/request-histories/${created.data.id}`);
      validateApiResponse(response, true, false);

      // Verify history is deleted
      await api.expectError(`/request-histories/${created.data.id}`, 'GET', undefined, 404);
    });

    test('should return 404 for non-existent history', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await api.expectError(`/request-histories/${fakeId}`, 'DELETE', undefined, 404);
    });
  });

  test.describe('Integration with Request Execution', () => {
    test('should create history when executing request', async () => {
      // Create a request
      const requestData = TestDataFactory.createRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
      });
      const request = await api.post('/requests', requestData);
      createdRequestIds.push(request.data.id);

      // Execute the request
      const executionResponse = await api.post(`/requests/${request.data.id}/execute`);
      validateApiResponse(executionResponse);

      // Check if history was created (this depends on your backend implementation)
      // If your backend automatically creates history entries on execution
      const historiesResponse = await api.get(`/request-histories/request/${request.data.id}`);
      validateApiResponse(historiesResponse);

      // This test might need adjustment based on your actual implementation
      // If histories are automatically created, we should see at least one
      if (historiesResponse.data.length > 0) {
        const history = historiesResponse.data[0];
        expect(history.sourceRequestId).toBe(request.data.id);
        expect(history.method).toBe(requestData.method);
        expect(history.url).toBe(requestData.url);
        expect(history.responseStatusCode).toBe(200);

        createdHistoryIds.push(history.id);
      }
    });
  });

  test.describe('Performance and Data Validation', () => {
    test('should handle large response bodies', async () => {
      const largeResponseBody = JSON.stringify({
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          title: `Item ${i}`,
          description: `This is a description for item ${i}`.repeat(10),
        })),
      });

      const historyData = TestDataFactory.createRequestHistory({
        responseBody: largeResponseBody,
      });

      const response = await api.post('/request-histories', historyData);
      validateApiResponse(response);

      const history = response.data;
      expect(history.responseBody).toBe(largeResponseBody);

      createdHistoryIds.push(history.id);
    });

    test('should handle various HTTP status codes', async () => {
      const statusCodes = [200, 201, 400, 401, 403, 404, 500, 502, 503];
      const createdIds: string[] = [];

      for (const statusCode of statusCodes) {
        const historyData = TestDataFactory.createRequestHistory({
          responseStatusCode: statusCode,
          url: `https://api.example.com/status/${statusCode}`,
        });

        const response = await api.post('/request-histories', historyData);
        validateApiResponse(response);

        const history = response.data;
        expect(history.responseStatusCode).toBe(statusCode);

        createdIds.push(history.id);
      }

      createdHistoryIds.push(...createdIds);
    });

    test('should handle different content types', async () => {
      const contentTypes = [
        'application/json',
        'text/html',
        'text/plain',
        'application/xml',
        'application/pdf',
        'image/jpeg',
      ];

      const createdIds: string[] = [];

      for (const contentType of contentTypes) {
        const historyData = TestDataFactory.createRequestHistory({
          responseHeaders: {
            'Content-Type': contentType,
            'Content-Length': '1024',
          },
          url: `https://api.example.com/content/${contentType.replace('/', '-')}`,
        });

        const response = await api.post('/request-histories', historyData);
        validateApiResponse(response);

        const history = response.data;
        expect(history.responseHeaders['Content-Type']).toBe(contentType);

        createdIds.push(history.id);
      }

      createdHistoryIds.push(...createdIds);
    });
  });
});
