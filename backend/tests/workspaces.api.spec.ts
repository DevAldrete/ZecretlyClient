import { test, expect } from '@playwright/test';
import { ApiTestHelper, validateApiResponse, validateUUID, validateTimestamp } from './utils/test-helpers';
import { TestDataFactory } from './utils/test-data';

test.describe('Workspaces API', () => {
  let api: ApiTestHelper;
  let createdWorkspaceIds: string[] = [];

  test.beforeEach(async ({ request }) => {
    api = new ApiTestHelper(request);
  });

  test.afterEach(async () => {
    // Cleanup created workspaces
    for (const id of createdWorkspaceIds) {
      try {
        await api.delete(`/workspaces/${id}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    createdWorkspaceIds = [];
  });

  test.describe('POST /api/workspaces', () => {
    test('should create a new workspace', async () => {
      const workspaceData = TestDataFactory.createWorkspace();

      const response = await api.post('/workspaces', workspaceData);
      validateApiResponse(response);

      const workspace = response.data;
      expect(workspace).toHaveProperty('id');
      expect(workspace).toHaveProperty('name', workspaceData.name);
      expect(workspace).toHaveProperty('description', workspaceData.description);
      expect(workspace).toHaveProperty('createdAt');
      expect(workspace).toHaveProperty('updatedAt');

      validateUUID(workspace.id);
      validateTimestamp(workspace.createdAt);
      validateTimestamp(workspace.updatedAt);

      createdWorkspaceIds.push(workspace.id);
    });

    test('should create workspace without description', async () => {
      const workspaceData = TestDataFactory.createWorkspace({ description: undefined });

      const response = await api.post('/workspaces', workspaceData);
      validateApiResponse(response);

      const workspace = response.data;
      expect(workspace.description).toBeNull();

      createdWorkspaceIds.push(workspace.id);
    });

    test('should reject workspace without name', async () => {
      const invalidData = { description: 'Test description' };

      await api.expectError('/workspaces', 'POST', invalidData, 400);
    });

    test('should reject workspace with empty name', async () => {
      const invalidData = { name: '', description: 'Test description' };

      await api.expectError('/workspaces', 'POST', invalidData, 400);
    });
  });

  test.describe('GET /api/workspaces', () => {
    test('should get all workspaces', async () => {
      // Create test workspaces
      const workspace1 = TestDataFactory.createWorkspace({ name: 'Test Workspace 1' });
      const workspace2 = TestDataFactory.createWorkspace({ name: 'Test Workspace 2' });

      const created1 = await api.post('/workspaces', workspace1);
      const created2 = await api.post('/workspaces', workspace2);

      createdWorkspaceIds.push(created1.data.id, created2.data.id);

      const response = await api.get('/workspaces');
      validateApiResponse(response);

      expect(Array.isArray(response.data)).toBeTruthy();
      expect(response.data.length).toBeGreaterThanOrEqual(2);

      // Check if our created workspaces are in the list
      const workspaceNames = response.data.map((w: any) => w.name);
      expect(workspaceNames).toContain('Test Workspace 1');
      expect(workspaceNames).toContain('Test Workspace 2');
    });

    test('should return empty array when no workspaces exist', async () => {
      const response = await api.get('/workspaces');
      validateApiResponse(response);

      expect(Array.isArray(response.data)).toBeTruthy();
    });
  });

  test.describe('GET /api/workspaces/:workspaceId', () => {
    test('should get workspace by ID', async () => {
      const workspaceData = TestDataFactory.createWorkspace();
      const created = await api.post('/workspaces', workspaceData);
      createdWorkspaceIds.push(created.data.id);

      const response = await api.get(`/workspaces/${created.data.id}`);
      validateApiResponse(response);

      const workspace = response.data;
      expect(workspace.id).toBe(created.data.id);
      expect(workspace.name).toBe(workspaceData.name);
      expect(workspace.description).toBe(workspaceData.description);
    });

    test('should return 404 for non-existent workspace', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await api.expectError(`/workspaces/${fakeId}`, 'GET', undefined, 404);
    });

    test('should return 400 for invalid UUID', async () => {
      await api.expectError('/workspaces/invalid-uuid', 'GET', undefined, 400);
    });
  });

  test.describe('PUT /api/workspaces/:workspaceId', () => {
    test('should update workspace', async () => {
      const workspaceData = TestDataFactory.createWorkspace();
      const created = await api.post('/workspaces', workspaceData);
      createdWorkspaceIds.push(created.data.id);

      const updateData = {
        name: 'Updated Workspace Name',
        description: 'Updated description',
      };

      const response = await api.put(`/workspaces/${created.data.id}`, updateData);
      validateApiResponse(response);

      const updated = response.data;
      expect(updated.id).toBe(created.data.id);
      expect(updated.name).toBe(updateData.name);
      expect(updated.description).toBe(updateData.description);
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(new Date(created.data.updatedAt).getTime());
    });

    test('should update only name', async () => {
      const workspaceData = TestDataFactory.createWorkspace();
      const created = await api.post('/workspaces', workspaceData);
      createdWorkspaceIds.push(created.data.id);

      const updateData = { name: 'Only Name Updated' };

      const response = await api.put(`/workspaces/${created.data.id}`, updateData);
      validateApiResponse(response);

      const updated = response.data;
      expect(updated.name).toBe(updateData.name);
      expect(updated.description).toBe(workspaceData.description);
    });

    test('should return 404 for non-existent workspace', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const updateData = { name: 'Updated Name' };

      await api.expectError(`/workspaces/${fakeId}`, 'PUT', updateData, 404);
    });
  });

  test.describe('DELETE /api/workspaces/:workspaceId', () => {
    test('should delete workspace', async () => {
      const workspaceData = TestDataFactory.createWorkspace();
      const created = await api.post('/workspaces', workspaceData);

      const response = await api.delete(`/workspaces/${created.data.id}`);
      validateApiResponse(response, true, false);

      // Verify workspace is deleted
      await api.expectError(`/workspaces/${created.data.id}`, 'GET', undefined, 404);
    });

    test('should return 404 for non-existent workspace', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await api.expectError(`/workspaces/${fakeId}`, 'DELETE', undefined, 404);
    });

    test('should return 400 for invalid UUID', async () => {
      await api.expectError('/workspaces/invalid-uuid', 'DELETE', undefined, 400);
    });
  });
});
