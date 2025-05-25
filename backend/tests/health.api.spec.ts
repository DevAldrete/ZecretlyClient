import { test, expect } from '@playwright/test';
import { ApiTestHelper, validateApiResponse } from './utils/test-helpers';

test.describe('Health Check API', () => {
  let api: ApiTestHelper;

  test.beforeEach(async ({ request }) => {
    api = new ApiTestHelper(request);
  });

  test('should return health status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('status', 'UP');
    expect(data).toHaveProperty('timestamp');

    // Validate timestamp format
    const timestamp = new Date(data.timestamp);
    expect(timestamp.getTime()).not.toBeNaN();
  });

  test('should respond quickly', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get('/api/health');
    const endTime = Date.now();

    expect(response.ok()).toBeTruthy();
    expect(endTime - startTime).toBeLessThan(1000); // Should respond within 1 second
  });

  test('should handle multiple concurrent requests', async ({ request }) => {
    const promises = Array.from({ length: 10 }, () =>
      request.get('/api/health')
    );

    const responses = await Promise.all(promises);

    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
    });
  });
});
