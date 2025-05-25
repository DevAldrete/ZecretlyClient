import { test, expect } from '@playwright/test';
import { ApiTestHelper, validateApiResponse, validateUUID, validateTimestamp } from './utils/test-helpers';
import { TestDataFactory } from './utils/test-data';

test.describe('Collections API', () => {
  let api: ApiTestHelper;
  let createdWorkspaceIds: string[] = [];
  let createdCollectionIds: string[] = [];

  test.beforeEach(async ({ request }) => {
    api = new ApiTestHelper(request);
  });

  test.afterEach(async () => {
    // Cleanup created collections
    for (const id of createdCollectionIds) {
      try {
        await api.delete(`/collections/${id}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    // Cleanup created workspaces
    for (const id of createdWorkspaceIds) {
      try {
        await api.delete(`/workspaces/${id}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    createdCollectionIds = [];
    createdWorkspaceIds = [];
  });

  test.describe('POST /api/collections', () => {
    test('should create a new collection', async () => {
      const collectionData = TestDataFactory.createCollection();

      const response = await api.post('/collections', collectionData);
      validateApiResponse(response);

      const collection = response.data;
      expect(collection).toHaveProperty('id');
      expect(collection).toHaveProperty('name', collectionData.name);
      expect(collection).toHaveProperty('description', collectionData.description);
      expect(collection).toHaveProperty('createdAt');
      expect(collection).toHaveProperty('updatedAt');

      validateUUID(collection.id);
      validateTimestamp(collection.createdAt);
      validateTimestamp(collection.updatedAt);

      createdCollectionIds.push(collection.id);
    });

    test('should create collection with workspace', async () => {
      // Create workspace first
      const workspaceData = TestDataFactory.createWorkspace();
      const workspace = await api.post('/workspaces', workspaceData);
      createdWorkspaceIds.push(workspace.data.id);

      const collectionData = TestDataFactory.createCollection({
        workspaceId: workspace.data.id,
      });

      const response = await api.post('/collections', collectionData);
      validateApiResponse(response);

      const collection = response.data;
      expect(collection.workspaceId).toBe(workspace.data.id);

      createdCollectionIds.push(collection.id);
    });

    test('should create collection without workspace', async () => {
      const collectionData = TestDataFactory.createCollection({
        workspaceId: undefined,
      });

      const response = await api.post('/collections', collectionData);
      validateApiResponse(response);

      const collection = response.data;
      expect(collection.workspaceId).toBeNull();

      createdCollectionIds.push(collection.id);
    });

    test('should reject collection without name', async () => {
      const invalidData = { description: 'Test description' };

      await api.expectError('/collections', 'POST', invalidData, 400);
    });

    test('should reject collection with invalid workspace ID', async () => {
      const invalidData = TestDataFactory.createCollection({
        workspaceId: 'invalid-uuid',
      });

      await api.expectError('/collections', 'POST', invalidData, 400);
    });
  });

  test.describe('GET /api/collections', () => {
    test('should get all collections', async () => {
      // Create test collections
      const collection1 = TestDataFactory.createCollection({ name: 'Test Collection 1' });
      const collection2 = TestDataFactory.createCollection({ name: 'Test Collection 2' });

      const created1 = await api.post('/collections', collection1);
      const created2 = await api.post('/collections', collection2);

      createdCollectionIds.push(created1.data.id, created2.data.id);

      const response = await api.get('/collections');
      validateApiResponse(response);

      expect(Array.isArray(response.data)).toBeTruthy();
      expect(response.data.length).toBeGreaterThanOrEqual(2);

      // Check if our created collections are in the list
      const collectionNames = response.data.map((c: any) => c.name);
      expect(collectionNames).toContain('Test Collection 1');
      expect(collectionNames).toContain('Test Collection 2');
    });
  });

  test.describe('GET /api/collections/:collectionId', () => {
    test('should get collection by ID', async () => {
      const collectionData = TestDataFactory.createCollection();
      const created = await api.post('/collections', collectionData);
      createdCollectionIds.push(created.data.id);

      const response = await api.get(`/collections/${created.data.id}`);
      validateApiResponse(response);

      const collection = response.data;
      expect(collection.id).toBe(created.data.id);
      expect(collection.name).toBe(collectionData.name);
      expect(collection.description).toBe(collectionData.description);
    });

    test('should return 404 for non-existent collection', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await api.expectError(`/collections/${fakeId}`, 'GET', undefined, 404);
    });
  });

  test.describe('GET /api/collections/workspace/:workspaceId', () => {
    test('should get collections by workspace', async () => {
      // Create workspace
      const workspaceData = TestDataFactory.createWorkspace();
      const workspace = await api.post('/workspaces', workspaceData);
      createdWorkspaceIds.push(workspace.data.id);

      // Create collections in workspace
      const collection1 = TestDataFactory.createCollection({
        workspaceId: workspace.data.id,
        name: 'Workspace Collection 1',
      });
      const collection2 = TestDataFactory.createCollection({
        workspaceId: workspace.data.id,
        name: 'Workspace Collection 2',
      });

      const created1 = await api.post('/collections', collection1);
      const created2 = await api.post('/collections', collection2);

      createdCollectionIds.push(created1.data.id, created2.data.id);

      const response = await api.get(`/collections/workspace/${workspace.data.id}`);
      validateApiResponse(response);

      expect(Array.isArray(response.data)).toBeTruthy();
      expect(response.data.length).toBe(2);

      response.data.forEach((collection: any) => {
        expect(collection.workspaceId).toBe(workspace.data.id);
      });
    });

    test('should return empty array for workspace with no collections', async () => {
      // Create workspace
      const workspaceData = TestDataFactory.createWorkspace();
      const workspace = await api.post('/workspaces', workspaceData);
      createdWorkspaceIds.push(workspace.data.id);

      const response = await api.get(`/collections/workspace/${workspace.data.id}`);
      validateApiResponse(response);

      expect(Array.isArray(response.data)).toBeTruthy();
      expect(response.data.length).toBe(0);
    });

    test('should return 404 for non-existent workspace', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await api.expectError(`/collections/workspace/${fakeId}`, 'GET', undefined, 404);
    });
  });

  test.describe('PUT /api/collections/:collectionId', () => {
    test('should update collection', async () => {
      const collectionData = TestDataFactory.createCollection();
      const created = await api.post('/collections', collectionData);
      createdCollectionIds.push(created.data.id);

      const updateData = {
        name: 'Updated Collection Name',
        description: 'Updated description',
      };

      const response = await api.put(`/collections/${created.data.id}`, updateData);
      validateApiResponse(response);

      const updated = response.data;
      expect(updated.id).toBe(created.data.id);
      expect(updated.name).toBe(updateData.name);
      expect(updated.description).toBe(updateData.description);
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(new Date(created.data.updatedAt).getTime());
    });

    test('should update collection workspace', async () => {
      // Create two workspaces
      const workspace1 = await api.post('/workspaces', TestDataFactory.createWorkspace());
      const workspace2 = await api.post('/workspaces', TestDataFactory.createWorkspace());
      createdWorkspaceIds.push(workspace1.data.id, workspace2.data.id);

      // Create collection in first workspace
      const collectionData = TestDataFactory.createCollection({
        workspaceId: workspace1.data.id,
      });
      const created = await api.post('/collections', collectionData);
      createdCollectionIds.push(created.data.id);

      // Move to second workspace
      const updateData = { workspaceId: workspace2.data.id };

      const response = await api.put(`/collections/${created.data.id}`, updateData);
      validateApiResponse(response);

      const updated = response.data;
      expect(updated.workspaceId).toBe(workspace2.data.id);
    });

    test('should return 404 for non-existent collection', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const updateData = { name: 'Updated Name' };

      await api.expectError(`/collections/${fakeId}`, 'PUT', updateData, 404);
    });
  });

  test.describe('DELETE /api/collections/:collectionId', () => {
    test('should delete collection', async () => {
      const collectionData = TestDataFactory.createCollection();
      const created = await api.post('/collections', collectionData);

      const response = await api.delete(`/collections/${created.data.id}`);
      validateApiResponse(response, true, false);

      // Verify collection is deleted
      await api.expectError(`/collections/${created.data.id}`, 'GET', undefined, 404);
    });

    test('should return 404 for non-existent collection', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await api.expectError(`/collections/${fakeId}`, 'DELETE', undefined, 404);
    });
  });
});
