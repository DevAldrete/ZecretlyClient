import { test, expect } from '@playwright/test';
import { ApiTestHelper, validateApiResponse, validateUUID, validateTimestamp } from './utils/test-helpers';
import { TestDataFactory } from './utils/test-data';

test.describe('Requests API', () => {
  let api: ApiTestHelper;
  let createdWorkspaceIds: string[] = [];
  let createdCollectionIds: string[] = [];
  let createdRequestIds: string[] = [];

  test.beforeEach(async ({ request }) => {
    api = new ApiTestHelper(request);
  });

  test.afterEach(async () => {
    // Cleanup in reverse order
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

    createdRequestIds = [];
    createdCollectionIds = [];
    createdWorkspaceIds = [];
  });

  test.describe('POST /api/requests', () => {
    test('should create a new request', async () => {
      const requestData = TestDataFactory.createRequest();

      const response = await api.post('/requests', requestData);
      validateApiResponse(response);

      const request = response.data;
      expect(request).toHaveProperty('id');
      expect(request).toHaveProperty('name', requestData.name);
      expect(request).toHaveProperty('method', requestData.method);
      expect(request).toHaveProperty('url', requestData.url);
      expect(request).toHaveProperty('headers');
      expect(request).toHaveProperty('bodyType', requestData.bodyType);
      expect(request).toHaveProperty('createdAt');
      expect(request).toHaveProperty('updatedAt');

      validateUUID(request.id);
      validateTimestamp(request.createdAt);
      validateTimestamp(request.updatedAt);

      createdRequestIds.push(request.id);
    });

    test('should create request with collection', async () => {
      // Create collection first
      const collectionData = TestDataFactory.createCollection();
      const collection = await api.post('/collections', collectionData);
      createdCollectionIds.push(collection.data.id);

      const requestData = TestDataFactory.createRequest({
        collectionId: collection.data.id,
      });

      const response = await api.post('/requests', requestData);
      validateApiResponse(response);

      const request = response.data;
      expect(request.collectionId).toBe(collection.data.id);

      createdRequestIds.push(request.id);
    });

    test('should create POST request with body', async () => {
      const requestData = TestDataFactory.createPostRequest();

      const response = await api.post('/requests', requestData);
      validateApiResponse(response);

      const request = response.data;
      expect(request.method).toBe('POST');
      expect(request.bodyType).toBe('json');
      expect(request.bodyContent).toBe(requestData.bodyContent);

      createdRequestIds.push(request.id);
    });

    test('should reject request without name', async () => {
      const invalidData = {
        method: 'GET',
        url: 'https://example.com',
      };

      await api.expectError('/requests', 'POST', invalidData, 400);
    });

    test('should reject request with invalid method', async () => {
      const invalidData = TestDataFactory.createRequest({
        method: 'INVALID' as any,
      });

      await api.expectError('/requests', 'POST', invalidData, 400);
    });

    test('should reject request with invalid URL', async () => {
      const invalidData = TestDataFactory.createRequest({
        url: 'not-a-valid-url',
      });

      await api.expectError('/requests', 'POST', invalidData, 400);
    });
  });

  test.describe('GET /api/requests', () => {
    test('should get all requests', async () => {
      // Create test requests
      const request1 = TestDataFactory.createRequest({ name: 'Test Request 1' });
      const request2 = TestDataFactory.createRequest({ name: 'Test Request 2' });

      const created1 = await api.post('/requests', request1);
      const created2 = await api.post('/requests', request2);

      createdRequestIds.push(created1.data.id, created2.data.id);

      const response = await api.get('/requests');
      validateApiResponse(response);

      expect(Array.isArray(response.data)).toBeTruthy();
      expect(response.data.length).toBeGreaterThanOrEqual(2);

      // Check if our created requests are in the list
      const requestNames = response.data.map((r: any) => r.name);
      expect(requestNames).toContain('Test Request 1');
      expect(requestNames).toContain('Test Request 2');
    });
  });

  test.describe('GET /api/requests/:requestId', () => {
    test('should get request by ID', async () => {
      const requestData = TestDataFactory.createRequest();
      const created = await api.post('/requests', requestData);
      createdRequestIds.push(created.data.id);

      const response = await api.get(`/requests/${created.data.id}`);
      validateApiResponse(response);

      const request = response.data;
      expect(request.id).toBe(created.data.id);
      expect(request.name).toBe(requestData.name);
      expect(request.method).toBe(requestData.method);
      expect(request.url).toBe(requestData.url);
    });

    test('should return 404 for non-existent request', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await api.expectError(`/requests/${fakeId}`, 'GET', undefined, 404);
    });
  });

  test.describe('GET /api/requests/collection/:collectionId', () => {
    test('should get requests by collection', async () => {
      // Create collection
      const collectionData = TestDataFactory.createCollection();
      const collection = await api.post('/collections', collectionData);
      createdCollectionIds.push(collection.data.id);

      // Create requests in collection
      const request1 = TestDataFactory.createRequest({
        collectionId: collection.data.id,
        name: 'Collection Request 1',
      });
      const request2 = TestDataFactory.createRequest({
        collectionId: collection.data.id,
        name: 'Collection Request 2',
      });

      const created1 = await api.post('/requests', request1);
      const created2 = await api.post('/requests', request2);

      createdRequestIds.push(created1.data.id, created2.data.id);

      const response = await api.get(`/requests/collection/${collection.data.id}`);
      validateApiResponse(response);

      expect(Array.isArray(response.data)).toBeTruthy();
      expect(response.data.length).toBe(2);

      response.data.forEach((request: any) => {
        expect(request.collectionId).toBe(collection.data.id);
      });
    });
  });

  test.describe('GET /api/requests/search', () => {
    test('should find similar requests', async () => {
      // Create a request
      const requestData = TestDataFactory.createRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
      });
      const created = await api.post('/requests', requestData);
      createdRequestIds.push(created.data.id);

      // Search for similar requests
      const response = await api.get('/requests/search?method=GET&url=https://jsonplaceholder.typicode.com/posts/1');
      validateApiResponse(response);

      expect(Array.isArray(response.data)).toBeTruthy();
      expect(response.data.length).toBeGreaterThanOrEqual(1);

      const foundRequest = response.data.find((r: any) => r.id === created.data.id);
      expect(foundRequest).toBeDefined();
    });
  });

  test.describe('PUT /api/requests/:requestId', () => {
    test('should update request', async () => {
      const requestData = TestDataFactory.createRequest();
      const created = await api.post('/requests', requestData);
      createdRequestIds.push(created.data.id);

      const updateData = {
        name: 'Updated Request Name',
        method: 'POST',
        url: 'https://updated-example.com/api',
        description: 'Updated description',
      };

      const response = await api.put(`/requests/${created.data.id}`, updateData);
      validateApiResponse(response);

      const updated = response.data;
      expect(updated.id).toBe(created.data.id);
      expect(updated.name).toBe(updateData.name);
      expect(updated.method).toBe(updateData.method);
      expect(updated.url).toBe(updateData.url);
      expect(updated.description).toBe(updateData.description);
    });
  });

  test.describe('PATCH /api/requests/:requestId/sort-order', () => {
    test('should update request sort order', async () => {
      const requestData = TestDataFactory.createRequest({ sortOrder: 1 });
      const created = await api.post('/requests', requestData);
      createdRequestIds.push(created.data.id);

      const updateData = { sortOrder: 5 };

      const response = await api.patch(`/requests/${created.data.id}/sort-order`, updateData);
      validateApiResponse(response);

      const updated = response.data;
      expect(updated.sortOrder).toBe(5);
    });
  });

  test.describe('POST /api/requests/:requestId/execute - CRITICAL FUNCTIONALITY', () => {
    test('should execute GET request successfully', async () => {
      const requestData = TestDataFactory.createRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
      });
      const created = await api.post('/requests', requestData);
      createdRequestIds.push(created.data.id);

      const response = await api.post(`/requests/${created.data.id}/execute`);
      validateApiResponse(response);

      const execution = response.data;
      expect(execution).toHaveProperty('statusCode');
      expect(execution).toHaveProperty('headers');
      expect(execution).toHaveProperty('body');
      expect(execution).toHaveProperty('durationMs');

      expect(execution.statusCode).toBe(200);
      expect(execution.durationMs).toBeGreaterThan(0);

      // Validate response body structure
      const responseBody = JSON.parse(execution.body);
      expect(responseBody).toHaveProperty('id', 1);
      expect(responseBody).toHaveProperty('title');
      expect(responseBody).toHaveProperty('body');
      expect(responseBody).toHaveProperty('userId');
    });

    test('should execute POST request successfully', async () => {
      const requestData = TestDataFactory.createPostRequest();
      const created = await api.post('/requests', requestData);
      createdRequestIds.push(created.data.id);

      const response = await api.post(`/requests/${created.data.id}/execute`);
      validateApiResponse(response);

      const execution = response.data;
      expect(execution.statusCode).toBe(201);

      const responseBody = JSON.parse(execution.body);
      expect(responseBody).toHaveProperty('id');
      expect(responseBody.title).toBe('Test Post');
    });

    test('should execute request with overrides', async () => {
      const requestData = TestDataFactory.createRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
      });
      const created = await api.post('/requests', requestData);
      createdRequestIds.push(created.data.id);

      const overrides = {
        url: 'https://jsonplaceholder.typicode.com/posts/2',
        headers: {
          'X-Custom-Header': 'test-value',
        },
      };

      const response = await api.post(`/requests/${created.data.id}/execute`, overrides);
      validateApiResponse(response);

      const execution = response.data;
      expect(execution.statusCode).toBe(200);

      const responseBody = JSON.parse(execution.body);
      expect(responseBody.id).toBe(2); // Should use overridden URL
    });

    test('should handle request execution errors gracefully', async () => {
      const requestData = TestDataFactory.createRequest({
        method: 'GET',
        url: 'https://non-existent-domain-12345.com/api',
      });
      const created = await api.post('/requests', requestData);
      createdRequestIds.push(created.data.id);

      // This should not throw but return error information
      const response = await api.post(`/requests/${created.data.id}/execute`);

      // The execution might fail but the API should handle it gracefully
      // Check if we get some error information back
      expect(response).toHaveProperty('success');
    });

    test('should execute request with custom headers', async () => {
      const requestData = TestDataFactory.createRequest({
        method: 'GET',
        url: 'https://httpbin.org/headers',
        headers: {
          'X-Test-Header': 'test-value',
          'User-Agent': 'ZecretlyClient-Test/1.0',
        },
      });
      const created = await api.post('/requests', requestData);
      createdRequestIds.push(created.data.id);

      const response = await api.post(`/requests/${created.data.id}/execute`);
      validateApiResponse(response);

      const execution = response.data;
      expect(execution.statusCode).toBe(200);

      const responseBody = JSON.parse(execution.body);
      expect(responseBody.headers).toHaveProperty('X-Test-Header', 'test-value');
    });

    test('should measure execution time accurately', async () => {
      const requestData = TestDataFactory.createRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
      });
      const created = await api.post('/requests', requestData);
      createdRequestIds.push(created.data.id);

      const startTime = Date.now();
      const response = await api.post(`/requests/${created.data.id}/execute`);
      const endTime = Date.now();

      validateApiResponse(response);

      const execution = response.data;
      expect(execution.durationMs).toBeGreaterThan(0);
      expect(execution.durationMs).toBeLessThan(endTime - startTime + 100); // Allow some margin
    });
  });

  test.describe('DELETE /api/requests/:requestId', () => {
    test('should delete request', async () => {
      const requestData = TestDataFactory.createRequest();
      const created = await api.post('/requests', requestData);

      const response = await api.delete(`/requests/${created.data.id}`);
      validateApiResponse(response, true, false); // Don't expect data for delete operations

      // Verify request is deleted
      await api.expectError(`/requests/${created.data.id}`, 'GET', undefined, 404);
    });

    test('should return 404 for non-existent request', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await api.expectError(`/requests/${fakeId}`, 'DELETE', undefined, 404);
    });
  });
});
