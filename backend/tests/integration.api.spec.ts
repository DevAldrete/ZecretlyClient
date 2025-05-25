import { test, expect } from '@playwright/test';
import { ApiTestHelper, validateApiResponse, validateUUID } from './utils/test-helpers';
import { TestDataFactory } from './utils/test-data';

test.describe('Integration Tests - Complete Workflows', () => {
  let api: ApiTestHelper;
  let createdWorkspaceIds: string[] = [];
  let createdCollectionIds: string[] = [];
  let createdRequestIds: string[] = [];
  let createdEnvironmentIds: string[] = [];
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

    for (const id of createdEnvironmentIds) {
      try {
        await api.delete(`/environments/${id}`);
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
    createdEnvironmentIds = [];
    createdCollectionIds = [];
    createdWorkspaceIds = [];
  });

  test.describe('Complete API Testing Workflow', () => {
    test('should create workspace, collection, environment, and execute requests with variable resolution', async () => {
      // Step 1: Create a workspace
      const workspaceData = TestDataFactory.createWorkspace({
        name: 'API Testing Workspace',
        description: 'Workspace for comprehensive API testing',
      });

      const workspace = await api.post('/workspaces', workspaceData);
      validateApiResponse(workspace);
      createdWorkspaceIds.push(workspace.data.id);

      // Step 2: Create an environment with variables
      const environmentData = TestDataFactory.createEnvironment({
        workspaceId: workspace.data.id,
        name: 'Testing Environment',
        variables: {
          BASE_URL: 'https://jsonplaceholder.typicode.com',
          API_VERSION: 'v1',
          USER_ID: '1',
          POST_ID: '1',
          AUTH_TOKEN: 'test-token-123',
        },
        isActive: true,
      });

      const environment = await api.post('/environments', environmentData);
      validateApiResponse(environment);
      createdEnvironmentIds.push(environment.data.id);

      // Step 3: Create a collection in the workspace
      const collectionData = TestDataFactory.createCollection({
        workspaceId: workspace.data.id,
        name: 'JSONPlaceholder API Collection',
        description: 'Collection for testing JSONPlaceholder API',
      });

      const collection = await api.post('/collections', collectionData);
      validateApiResponse(collection);
      createdCollectionIds.push(collection.data.id);

      // Step 4: Create requests with environment variables
      const getPostRequest = TestDataFactory.createRequest({
        collectionId: collection.data.id,
        name: 'Get Post by ID',
        method: 'GET',
        url: '{{BASE_URL}}/posts/{{POST_ID}}',
        headers: {
          'Authorization': 'Bearer {{AUTH_TOKEN}}',
          'Content-Type': 'application/json',
        },
        sortOrder: 1,
      });

      const getUserRequest = TestDataFactory.createRequest({
        collectionId: collection.data.id,
        name: 'Get User by ID',
        method: 'GET',
        url: '{{BASE_URL}}/users/{{USER_ID}}',
        headers: {
          'Authorization': 'Bearer {{AUTH_TOKEN}}',
        },
        sortOrder: 2,
      });

      const createPostRequest = TestDataFactory.createPostRequest({
        collectionId: collection.data.id,
        name: 'Create New Post',
        url: '{{BASE_URL}}/posts',
        headers: {
          'Authorization': 'Bearer {{AUTH_TOKEN}}',
          'Content-Type': 'application/json',
        },
        bodyContent: JSON.stringify({
          title: 'Test Post from {{USER_ID}}',
          body: 'This is a test post created via API',
          userId: '{{USER_ID}}',
        }),
        sortOrder: 3,
      });

      const createdGetPost = await api.post('/requests', getPostRequest);
      const createdGetUser = await api.post('/requests', getUserRequest);
      const createdCreatePost = await api.post('/requests', createPostRequest);

      validateApiResponse(createdGetPost);
      validateApiResponse(createdGetUser);
      validateApiResponse(createdCreatePost);

      createdRequestIds.push(
        createdGetPost.data.id,
        createdGetUser.data.id,
        createdCreatePost.data.id
      );

      // Step 5: Test variable resolution
      const textToResolve = {
        text: 'GET {{BASE_URL}}/{{API_VERSION}}/users/{{USER_ID}} with token {{AUTH_TOKEN}}',
      };

      const resolvedResponse = await api.post(`/environments/${environment.data.id}/resolve`, textToResolve);
      validateApiResponse(resolvedResponse);

      expect(resolvedResponse.data.resolvedText).toBe(
        'GET https://jsonplaceholder.typicode.com/v1/users/1 with token test-token-123'
      );

      // Step 6: Execute requests and verify they work
      const getPostExecution = await api.post(`/requests/${createdGetPost.data.id}/execute`);
      validateApiResponse(getPostExecution);

      expect(getPostExecution.data.statusCode).toBe(200);
      const postResponse = JSON.parse(getPostExecution.data.body);
      expect(postResponse).toHaveProperty('id', 1);
      expect(postResponse).toHaveProperty('title');
      expect(postResponse).toHaveProperty('body');

      const getUserExecution = await api.post(`/requests/${createdGetUser.data.id}/execute`);
      validateApiResponse(getUserExecution);

      expect(getUserExecution.data.statusCode).toBe(200);
      const userResponse = JSON.parse(getUserExecution.data.body);
      expect(userResponse).toHaveProperty('id', 1);
      expect(userResponse).toHaveProperty('name');
      expect(userResponse).toHaveProperty('email');

      const createPostExecution = await api.post(`/requests/${createdCreatePost.data.id}/execute`);
      validateApiResponse(createPostExecution);

      expect(createPostExecution.data.statusCode).toBe(201);
      const createdPostResponse = JSON.parse(createPostExecution.data.body);
      expect(createdPostResponse).toHaveProperty('id');
      expect(createdPostResponse.title).toContain('Test Post from 1');

      // Step 7: Verify collections contain the requests
      const collectionRequests = await api.get(`/requests/collection/${collection.data.id}`);
      validateApiResponse(collectionRequests);

      expect(collectionRequests.data.length).toBe(3);
      const sortOrders = collectionRequests.data.map((r: any) => r.sortOrder).sort();
      expect(sortOrders).toEqual([1, 2, 3]);

      // Step 8: Verify workspace contains the collection
      const workspaceCollections = await api.get(`/collections/workspace/${workspace.data.id}`);
      validateApiResponse(workspaceCollections);

      expect(workspaceCollections.data.length).toBe(1);
      expect(workspaceCollections.data[0].id).toBe(collection.data.id);

      // Step 9: Verify environment is active for workspace
      const activeEnvironment = await api.get(`/environments/workspace/${workspace.data.id}/active`);
      validateApiResponse(activeEnvironment);

      expect(activeEnvironment.data.id).toBe(environment.data.id);
      expect(activeEnvironment.data.isActive).toBe(true);
    });
  });

  test.describe('Request Execution with Environment Variables', () => {
    test('should execute request with variable substitution', async () => {
      // Create environment with test variables
      const environmentData = TestDataFactory.createEnvironment({
        name: 'Variable Test Environment',
        variables: {
          BASE_URL: 'https://httpbin.org',
          ENDPOINT: 'get',
          CUSTOM_HEADER: 'test-header-value',
          QUERY_PARAM: 'test-param',
        },
        isActive: true,
      });

      const environment = await api.post('/environments', environmentData);
      validateApiResponse(environment);
      createdEnvironmentIds.push(environment.data.id);

      // Create request with variables
      const requestData = TestDataFactory.createRequest({
        name: 'Variable Test Request',
        method: 'GET',
        url: '{{BASE_URL}}/{{ENDPOINT}}?test={{QUERY_PARAM}}',
        headers: {
          'X-Custom-Header': '{{CUSTOM_HEADER}}',
          'User-Agent': 'ZecretlyClient/1.0',
        },
      });

      const request = await api.post('/requests', requestData);
      validateApiResponse(request);
      createdRequestIds.push(request.data.id);

      // Execute request - variables should be resolved
      const execution = await api.post(`/requests/${request.data.id}/execute`);
      validateApiResponse(execution);

      expect(execution.data.statusCode).toBe(200);

      const responseBody = JSON.parse(execution.data.body);
      expect(responseBody.url).toBe('https://httpbin.org/get?test=test-param');
      expect(responseBody.headers).toHaveProperty('X-Custom-Header', 'test-header-value');
    });

    test('should handle missing variables gracefully', async () => {
      // Create environment with limited variables
      const environmentData = TestDataFactory.createEnvironment({
        name: 'Limited Variables Environment',
        variables: {
          BASE_URL: 'https://httpbin.org',
        },
        isActive: true,
      });

      const environment = await api.post('/environments', environmentData);
      validateApiResponse(environment);
      createdEnvironmentIds.push(environment.data.id);

      // Create request with missing variables
      const requestData = TestDataFactory.createRequest({
        name: 'Missing Variables Request',
        method: 'GET',
        url: '{{BASE_URL}}/get?missing={{MISSING_VAR}}',
        headers: {
          'X-Missing-Header': '{{MISSING_HEADER}}',
        },
      });

      const request = await api.post('/requests', requestData);
      validateApiResponse(request);
      createdRequestIds.push(request.data.id);

      // Execute request - missing variables should remain as-is
      const execution = await api.post(`/requests/${request.data.id}/execute`);
      validateApiResponse(execution);

      expect(execution.data.statusCode).toBe(200);

      const responseBody = JSON.parse(execution.data.body);
      expect(responseBody.url).toBe('https://httpbin.org/get?missing={{MISSING_VAR}}');
      expect(responseBody.headers).toHaveProperty('X-Missing-Header', '{{MISSING_HEADER}}');
    });
  });

  test.describe('Cross-Module Data Consistency', () => {
    test('should maintain data consistency across modules', async () => {
      // Create workspace
      const workspace = await api.post('/workspaces', TestDataFactory.createWorkspace());
      validateApiResponse(workspace);
      createdWorkspaceIds.push(workspace.data.id);

      // Create collection in workspace
      const collection = await api.post('/collections', TestDataFactory.createCollection({
        workspaceId: workspace.data.id,
      }));
      validateApiResponse(collection);
      createdCollectionIds.push(collection.data.id);

      // Create request in collection
      const request = await api.post('/requests', TestDataFactory.createRequest({
        collectionId: collection.data.id,
      }));
      validateApiResponse(request);
      createdRequestIds.push(request.data.id);

      // Create environment in workspace
      const environment = await api.post('/environments', TestDataFactory.createEnvironment({
        workspaceId: workspace.data.id,
      }));
      validateApiResponse(environment);
      createdEnvironmentIds.push(environment.data.id);

      // Verify relationships
      const workspaceCollections = await api.get(`/collections/workspace/${workspace.data.id}`);
      validateApiResponse(workspaceCollections);
      expect(workspaceCollections.data).toHaveLength(1);
      expect(workspaceCollections.data[0].id).toBe(collection.data.id);

      const collectionRequests = await api.get(`/requests/collection/${collection.data.id}`);
      validateApiResponse(collectionRequests);
      expect(collectionRequests.data).toHaveLength(1);
      expect(collectionRequests.data[0].id).toBe(request.data.id);

      const workspaceEnvironments = await api.get(`/environments/workspace/${workspace.data.id}`);
      validateApiResponse(workspaceEnvironments);
      expect(workspaceEnvironments.data).toHaveLength(1);
      expect(workspaceEnvironments.data[0].id).toBe(environment.data.id);

      // Delete workspace and verify cascade behavior
      await api.delete(`/workspaces/${workspace.data.id}`);

      // Verify workspace is deleted
      await api.expectError(`/workspaces/${workspace.data.id}`, 'GET', undefined, 404);

      // Check if related entities still exist (depends on your cascade implementation)
      // This test might need adjustment based on your actual cascade behavior
    });
  });

  test.describe('Performance and Stress Testing', () => {
    test('should handle multiple concurrent requests', async () => {
      // Create multiple requests concurrently
      const promises = Array.from({ length: 10 }, (_, i) =>
        api.post('/workspaces', TestDataFactory.createWorkspace({
          name: `Concurrent Workspace ${i}`,
        }))
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        validateApiResponse(result);
        createdWorkspaceIds.push(result.data.id);
      });

      expect(results).toHaveLength(10);

      // Verify all workspaces were created
      const allWorkspaces = await api.get('/workspaces');
      validateApiResponse(allWorkspaces);

      const createdNames = results.map(r => r.data.name);
      const fetchedNames = allWorkspaces.data.map((w: any) => w.name);

      createdNames.forEach(name => {
        expect(fetchedNames).toContain(name);
      });
    });

    test('should handle rapid request execution', async () => {
      // Create a simple request
      const requestData = TestDataFactory.createRequest({
        method: 'GET',
        url: 'https://httpbin.org/delay/0.1', // Small delay to simulate real API
      });

      const request = await api.post('/requests', requestData);
      validateApiResponse(request);
      createdRequestIds.push(request.data.id);

      // Execute the same request multiple times rapidly
      const executionPromises = Array.from({ length: 5 }, () =>
        api.post(`/requests/${request.data.id}/execute`)
      );

      const executions = await Promise.all(executionPromises);

      executions.forEach(execution => {
        validateApiResponse(execution);
        expect(execution.data.statusCode).toBe(200);
        expect(execution.data.durationMs).toBeGreaterThan(0);
      });
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle invalid UUIDs gracefully', async () => {
      const invalidUUIDs = [
        'invalid-uuid',
        '123',
        '',
        'not-a-uuid-at-all',
        '550e8400-e29b-41d4-a716', // incomplete UUID
      ];

      for (const invalidUUID of invalidUUIDs) {
        await api.expectError(`/workspaces/${invalidUUID}`, 'GET', undefined, 400);
        await api.expectError(`/collections/${invalidUUID}`, 'GET', undefined, 400);
        await api.expectError(`/requests/${invalidUUID}`, 'GET', undefined, 400);
        await api.expectError(`/environments/${invalidUUID}`, 'GET', undefined, 400);
      }
    });

    test('should handle large payloads', async () => {
      // Create a request with a large body
      const largeBody = {
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          title: `Item ${i}`,
          description: 'A'.repeat(1000), // 1000 characters per item
          metadata: {
            tags: Array.from({ length: 10 }, (_, j) => `tag-${i}-${j}`),
            properties: Object.fromEntries(
              Array.from({ length: 20 }, (_, k) => [`prop${k}`, `value-${i}-${k}`])
            ),
          },
        })),
      };

      const requestData = TestDataFactory.createPostRequest({
        name: 'Large Payload Request',
        url: 'https://httpbin.org/post',
        bodyContent: JSON.stringify(largeBody),
      });

      const request = await api.post('/requests', requestData);
      validateApiResponse(request);
      createdRequestIds.push(request.data.id);

      // Execute the request with large payload
      const execution = await api.post(`/requests/${request.data.id}/execute`);
      validateApiResponse(execution);

      expect(execution.data.statusCode).toBe(200);

      const responseBody = JSON.parse(execution.data.body);
      expect(responseBody.json.data).toHaveLength(1000);
    });
  });
});
