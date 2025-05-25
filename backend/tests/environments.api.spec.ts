import { test, expect } from '@playwright/test';
import { ApiTestHelper, validateApiResponse, validateUUID, validateTimestamp } from './utils/test-helpers';
import { TestDataFactory } from './utils/test-data';

test.describe('Environments API', () => {
  let api: ApiTestHelper;
  let createdWorkspaceIds: string[] = [];
  let createdEnvironmentIds: string[] = [];

  test.beforeEach(async ({ request }) => {
    api = new ApiTestHelper(request);
  });

  test.afterEach(async () => {
    // Cleanup created environments
    for (const id of createdEnvironmentIds) {
      try {
        await api.delete(`/environments/${id}`);
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

    createdEnvironmentIds = [];
    createdWorkspaceIds = [];
  });

  test.describe('POST /api/environments', () => {
    test('should create a new environment', async () => {
      const environmentData = TestDataFactory.createEnvironment();

      const response = await api.post('/environments', environmentData);
      validateApiResponse(response);

      const environment = response.data;
      expect(environment).toHaveProperty('id');
      expect(environment).toHaveProperty('name', environmentData.name);
      expect(environment).toHaveProperty('variables');
      expect(environment).toHaveProperty('isActive', environmentData.isActive);
      expect(environment).toHaveProperty('createdAt');
      expect(environment).toHaveProperty('updatedAt');

      validateUUID(environment.id);
      validateTimestamp(environment.createdAt);
      validateTimestamp(environment.updatedAt);

      createdEnvironmentIds.push(environment.id);
    });

    test('should create environment with workspace', async () => {
      // Create workspace first
      const workspaceData = TestDataFactory.createWorkspace();
      const workspace = await api.post('/workspaces', workspaceData);
      createdWorkspaceIds.push(workspace.data.id);

      const environmentData = TestDataFactory.createEnvironment({
        workspaceId: workspace.data.id,
      });

      const response = await api.post('/environments', environmentData);
      validateApiResponse(response);

      const environment = response.data;
      expect(environment.workspaceId).toBe(workspace.data.id);

      createdEnvironmentIds.push(environment.id);
    });

    test('should create environment without variables', async () => {
      const environmentData = TestDataFactory.createEnvironment({
        variables: undefined,
      });

      const response = await api.post('/environments', environmentData);
      validateApiResponse(response);

      const environment = response.data;
      expect(environment.variables).toBeNull();

      createdEnvironmentIds.push(environment.id);
    });

    test('should reject environment without name', async () => {
      const invalidData = { variables: { TEST: 'value' } };

      await api.expectError('/environments', 'POST', invalidData, 400);
    });
  });

  test.describe('GET /api/environments', () => {
    test('should get all environments', async () => {
      // Create test environments
      const env1 = TestDataFactory.createEnvironment({ name: 'Test Environment 1' });
      const env2 = TestDataFactory.createEnvironment({ name: 'Test Environment 2' });

      const created1 = await api.post('/environments', env1);
      const created2 = await api.post('/environments', env2);

      createdEnvironmentIds.push(created1.data.id, created2.data.id);

      const response = await api.get('/environments');
      validateApiResponse(response);

      expect(Array.isArray(response.data)).toBeTruthy();
      expect(response.data.length).toBeGreaterThanOrEqual(2);

      // Check if our created environments are in the list
      const environmentNames = response.data.map((e: any) => e.name);
      expect(environmentNames).toContain('Test Environment 1');
      expect(environmentNames).toContain('Test Environment 2');
    });
  });

  test.describe('GET /api/environments/:environmentId', () => {
    test('should get environment by ID', async () => {
      const environmentData = TestDataFactory.createEnvironment();
      const created = await api.post('/environments', environmentData);
      createdEnvironmentIds.push(created.data.id);

      const response = await api.get(`/environments/${created.data.id}`);
      validateApiResponse(response);

      const environment = response.data;
      expect(environment.id).toBe(created.data.id);
      expect(environment.name).toBe(environmentData.name);
      expect(environment.variables).toEqual(environmentData.variables);
    });

    test('should return 404 for non-existent environment', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await api.expectError(`/environments/${fakeId}`, 'GET', undefined, 404);
    });
  });

  test.describe('GET /api/environments/workspace/:workspaceId', () => {
    test('should get environments by workspace', async () => {
      // Create workspace
      const workspaceData = TestDataFactory.createWorkspace();
      const workspace = await api.post('/workspaces', workspaceData);
      createdWorkspaceIds.push(workspace.data.id);

      // Create environments in workspace
      const env1 = TestDataFactory.createEnvironment({
        workspaceId: workspace.data.id,
        name: 'Workspace Environment 1',
      });
      const env2 = TestDataFactory.createEnvironment({
        workspaceId: workspace.data.id,
        name: 'Workspace Environment 2',
      });

      const created1 = await api.post('/environments', env1);
      const created2 = await api.post('/environments', env2);

      createdEnvironmentIds.push(created1.data.id, created2.data.id);

      const response = await api.get(`/environments/workspace/${workspace.data.id}`);
      validateApiResponse(response);

      expect(Array.isArray(response.data)).toBeTruthy();
      expect(response.data.length).toBe(2);

      response.data.forEach((environment: any) => {
        expect(environment.workspaceId).toBe(workspace.data.id);
      });
    });
  });

  test.describe('GET /api/environments/workspace/:workspaceId/active', () => {
    test('should get active environment by workspace', async () => {
      // Create workspace
      const workspaceData = TestDataFactory.createWorkspace();
      const workspace = await api.post('/workspaces', workspaceData);
      createdWorkspaceIds.push(workspace.data.id);

      // Create inactive environment
      const inactiveEnv = TestDataFactory.createEnvironment({
        workspaceId: workspace.data.id,
        name: 'Inactive Environment',
        isActive: false,
      });
      const createdInactive = await api.post('/environments', inactiveEnv);
      createdEnvironmentIds.push(createdInactive.data.id);

      // Create active environment
      const activeEnv = TestDataFactory.createEnvironment({
        workspaceId: workspace.data.id,
        name: 'Active Environment',
        isActive: true,
      });
      const createdActive = await api.post('/environments', activeEnv);
      createdEnvironmentIds.push(createdActive.data.id);

      const response = await api.get(`/environments/workspace/${workspace.data.id}/active`);
      validateApiResponse(response);

      const activeEnvironment = response.data;
      expect(activeEnvironment.id).toBe(createdActive.data.id);
      expect(activeEnvironment.isActive).toBe(true);
    });

    test('should return 404 when no active environment exists', async () => {
      // Create workspace
      const workspaceData = TestDataFactory.createWorkspace();
      const workspace = await api.post('/workspaces', workspaceData);
      createdWorkspaceIds.push(workspace.data.id);

      await api.expectError(`/environments/workspace/${workspace.data.id}/active`, 'GET', undefined, 404);
    });
  });

  test.describe('PUT /api/environments/:environmentId', () => {
    test('should update environment', async () => {
      const environmentData = TestDataFactory.createEnvironment();
      const created = await api.post('/environments', environmentData);
      createdEnvironmentIds.push(created.data.id);

      const updateData = {
        name: 'Updated Environment Name',
        variables: {
          NEW_VAR: 'new-value',
          UPDATED_VAR: 'updated-value',
        },
        isActive: true,
      };

      const response = await api.put(`/environments/${created.data.id}`, updateData);
      validateApiResponse(response);

      const updated = response.data;
      expect(updated.id).toBe(created.data.id);
      expect(updated.name).toBe(updateData.name);
      expect(updated.variables).toEqual(updateData.variables);
      expect(updated.isActive).toBe(updateData.isActive);
    });
  });

  test.describe('POST /api/environments/:environmentId/activate', () => {
    test('should activate environment', async () => {
      const environmentData = TestDataFactory.createEnvironment({ isActive: false });
      const created = await api.post('/environments', environmentData);
      createdEnvironmentIds.push(created.data.id);

      const response = await api.post(`/environments/${created.data.id}/activate`);
      validateApiResponse(response);

      const activated = response.data;
      expect(activated.isActive).toBe(true);
    });
  });

  test.describe('POST /api/environments/:environmentId/deactivate', () => {
    test('should deactivate environment', async () => {
      const environmentData = TestDataFactory.createEnvironment({ isActive: true });
      const created = await api.post('/environments', environmentData);
      createdEnvironmentIds.push(created.data.id);

      const response = await api.post(`/environments/${created.data.id}/deactivate`);
      validateApiResponse(response);

      const deactivated = response.data;
      expect(deactivated.isActive).toBe(false);
    });
  });

  test.describe('PUT /api/environments/:environmentId/variables', () => {
    test('should update environment variable', async () => {
      const environmentData = TestDataFactory.createEnvironment();
      const created = await api.post('/environments', environmentData);
      createdEnvironmentIds.push(created.data.id);

      const variableUpdate = {
        key: 'NEW_VARIABLE',
        value: 'new-variable-value',
      };

      const response = await api.put(`/environments/${created.data.id}/variables`, variableUpdate);
      validateApiResponse(response);

      const updated = response.data;
      expect(updated.variables).toHaveProperty('NEW_VARIABLE', 'new-variable-value');
      // Should preserve existing variables
      expect(updated.variables).toHaveProperty('BASE_URL');
    });

    test('should update existing variable', async () => {
      const environmentData = TestDataFactory.createEnvironment();
      const created = await api.post('/environments', environmentData);
      createdEnvironmentIds.push(created.data.id);

      const variableUpdate = {
        key: 'BASE_URL',
        value: 'https://updated-api.example.com',
      };

      const response = await api.put(`/environments/${created.data.id}/variables`, variableUpdate);
      validateApiResponse(response);

      const updated = response.data;
      expect(updated.variables.BASE_URL).toBe('https://updated-api.example.com');
    });
  });

  test.describe('DELETE /api/environments/:environmentId/variables', () => {
    test('should remove environment variable', async () => {
      const environmentData = TestDataFactory.createEnvironment();
      const created = await api.post('/environments', environmentData);
      createdEnvironmentIds.push(created.data.id);

      const variableRemoval = { key: 'API_KEY' };

      const response = await api.deleteWithBody(`/environments/${created.data.id}/variables`, variableRemoval);
      validateApiResponse(response);

      const updated = response.data;
      expect(updated.variables).not.toHaveProperty('API_KEY');
      // Should preserve other variables
      expect(updated.variables).toHaveProperty('BASE_URL');
    });
  });

  test.describe('POST /api/environments/:environmentId/resolve - CRITICAL FUNCTIONALITY', () => {
    test('should resolve variables in text', async () => {
      const environmentData = TestDataFactory.createEnvironment({
        variables: {
          BASE_URL: 'https://api.example.com',
          API_KEY: 'secret-key-123',
          VERSION: 'v2',
          USER_ID: '12345',
        },
      });
      const created = await api.post('/environments', environmentData);
      createdEnvironmentIds.push(created.data.id);

      const textToResolve = {
        text: '{{BASE_URL}}/{{VERSION}}/users/{{USER_ID}}?api_key={{API_KEY}}',
      };

      const response = await api.post(`/environments/${created.data.id}/resolve`, textToResolve);
      validateApiResponse(response);

      const resolved = response.data;
      expect(resolved.resolvedText).toBe('https://api.example.com/v2/users/12345?api_key=secret-key-123');
    });

    test('should handle partial variable resolution', async () => {
      const environmentData = TestDataFactory.createEnvironment({
        variables: {
          BASE_URL: 'https://api.example.com',
          VERSION: 'v1',
        },
      });
      const created = await api.post('/environments', environmentData);
      createdEnvironmentIds.push(created.data.id);

      const textToResolve = {
        text: '{{BASE_URL}}/{{VERSION}}/users/{{MISSING_VAR}}',
      };

      const response = await api.post(`/environments/${created.data.id}/resolve`, textToResolve);
      validateApiResponse(response);

      const resolved = response.data;
      expect(resolved.resolvedText).toBe('https://api.example.com/v1/users/{{MISSING_VAR}}');
    });

    test('should handle text without variables', async () => {
      const environmentData = TestDataFactory.createEnvironment();
      const created = await api.post('/environments', environmentData);
      createdEnvironmentIds.push(created.data.id);

      const textToResolve = {
        text: 'https://static-api.example.com/v1/users',
      };

      const response = await api.post(`/environments/${created.data.id}/resolve`, textToResolve);
      validateApiResponse(response);

      const resolved = response.data;
      expect(resolved.resolvedText).toBe('https://static-api.example.com/v1/users');
    });

    test('should handle complex nested variables', async () => {
      const environmentData = TestDataFactory.createEnvironment({
        variables: {
          PROTOCOL: 'https',
          DOMAIN: 'api.example.com',
          PORT: '8080',
          PATH: '/api/v1',
          TOKEN: 'bearer-token-xyz',
        },
      });
      const created = await api.post('/environments', environmentData);
      createdEnvironmentIds.push(created.data.id);

      const textToResolve = {
        text: '{{PROTOCOL}}://{{DOMAIN}}:{{PORT}}{{PATH}}/users\nAuthorization: Bearer {{TOKEN}}',
      };

      const response = await api.post(`/environments/${created.data.id}/resolve`, textToResolve);
      validateApiResponse(response);

      const resolved = response.data;
      expect(resolved.resolvedText).toBe('https://api.example.com:8080/api/v1/users\nAuthorization: Bearer bearer-token-xyz');
    });

    test('should handle empty variables', async () => {
      const environmentData = TestDataFactory.createEnvironment({
        variables: {
          EMPTY_VAR: '',
          NORMAL_VAR: 'value',
        },
      });
      const created = await api.post('/environments', environmentData);
      createdEnvironmentIds.push(created.data.id);

      const textToResolve = {
        text: 'prefix-{{EMPTY_VAR}}-{{NORMAL_VAR}}-suffix',
      };

      const response = await api.post(`/environments/${created.data.id}/resolve`, textToResolve);
      validateApiResponse(response);

      const resolved = response.data;
      expect(resolved.resolvedText).toBe('prefix--value-suffix');
    });
  });

  test.describe('DELETE /api/environments/:environmentId', () => {
    test('should delete environment', async () => {
      const environmentData = TestDataFactory.createEnvironment();
      const created = await api.post('/environments', environmentData);

      const response = await api.delete(`/environments/${created.data.id}`);
      validateApiResponse(response, true, false); // Don't expect data for delete operations

      // Verify environment is deleted
      await api.expectError(`/environments/${created.data.id}`, 'GET', undefined, 404);
    });

    test('should return 404 for non-existent environment', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      await api.expectError(`/environments/${fakeId}`, 'DELETE', undefined, 404);
    });
  });
});
