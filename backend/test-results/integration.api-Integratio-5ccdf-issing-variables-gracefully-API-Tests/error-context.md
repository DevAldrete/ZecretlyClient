# Test info

- Name: Integration Tests - Complete Workflows >> Request Execution with Environment Variables >> should handle missing variables gracefully
- Location: /home/aldrete/programming/ZecretlyClient/backend/tests/integration.api.spec.ts:268:9

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "https://httpbin.org/get?missing={{MISSING_VAR}}"
Received: "https://jsonplaceholder.typicode.com/get?missing={{MISSING_VAR}}"
    at /home/aldrete/programming/ZecretlyClient/backend/tests/integration.api.spec.ts:303:32
```

# Test source

```ts
  203 |
  204 |       expect(collectionRequests.data.length).toBe(3);
  205 |       const sortOrders = collectionRequests.data.map((r: any) => r.sortOrder).sort();
  206 |       expect(sortOrders).toEqual([1, 2, 3]);
  207 |
  208 |       // Step 8: Verify workspace contains the collection
  209 |       const workspaceCollections = await api.get(`/collections/workspace/${workspace.data.id}`);
  210 |       validateApiResponse(workspaceCollections);
  211 |
  212 |       expect(workspaceCollections.data.length).toBe(1);
  213 |       expect(workspaceCollections.data[0].id).toBe(collection.data.id);
  214 |
  215 |       // Step 9: Verify environment is active for workspace
  216 |       const activeEnvironment = await api.get(`/environments/workspace/${workspace.data.id}/active`);
  217 |       validateApiResponse(activeEnvironment);
  218 |
  219 |       expect(activeEnvironment.data.id).toBe(environment.data.id);
  220 |       expect(activeEnvironment.data.isActive).toBe(true);
  221 |     });
  222 |   });
  223 |
  224 |   test.describe('Request Execution with Environment Variables', () => {
  225 |     test('should execute request with variable substitution', async () => {
  226 |       // Create environment with test variables
  227 |       const environmentData = TestDataFactory.createEnvironment({
  228 |         name: 'Variable Test Environment',
  229 |         variables: {
  230 |           BASE_URL: 'https://httpbin.org',
  231 |           ENDPOINT: 'get',
  232 |           CUSTOM_HEADER: 'test-header-value',
  233 |           QUERY_PARAM: 'test-param',
  234 |         },
  235 |         isActive: true,
  236 |       });
  237 |
  238 |       const environment = await api.post('/environments', environmentData);
  239 |       validateApiResponse(environment);
  240 |       createdEnvironmentIds.push(environment.data.id);
  241 |
  242 |       // Create request with variables
  243 |       const requestData = TestDataFactory.createRequest({
  244 |         name: 'Variable Test Request',
  245 |         method: 'GET',
  246 |         url: '{{BASE_URL}}/{{ENDPOINT}}?test={{QUERY_PARAM}}',
  247 |         headers: {
  248 |           'X-Custom-Header': '{{CUSTOM_HEADER}}',
  249 |           'User-Agent': 'ZecretlyClient/1.0',
  250 |         },
  251 |       });
  252 |
  253 |       const request = await api.post('/requests', requestData);
  254 |       validateApiResponse(request);
  255 |       createdRequestIds.push(request.data.id);
  256 |
  257 |       // Execute request - variables should be resolved
  258 |       const execution = await api.post(`/requests/${request.data.id}/execute`);
  259 |       validateApiResponse(execution);
  260 |
  261 |       expect(execution.data.statusCode).toBe(200);
  262 |
  263 |       const responseBody = JSON.parse(execution.data.body);
  264 |       expect(responseBody.url).toBe('https://httpbin.org/get?test=test-param');
  265 |       expect(responseBody.headers).toHaveProperty('X-Custom-Header', 'test-header-value');
  266 |     });
  267 |
  268 |     test('should handle missing variables gracefully', async () => {
  269 |       // Create environment with limited variables
  270 |       const environmentData = TestDataFactory.createEnvironment({
  271 |         name: 'Limited Variables Environment',
  272 |         variables: {
  273 |           BASE_URL: 'https://httpbin.org',
  274 |         },
  275 |         isActive: true,
  276 |       });
  277 |
  278 |       const environment = await api.post('/environments', environmentData);
  279 |       validateApiResponse(environment);
  280 |       createdEnvironmentIds.push(environment.data.id);
  281 |
  282 |       // Create request with missing variables
  283 |       const requestData = TestDataFactory.createRequest({
  284 |         name: 'Missing Variables Request',
  285 |         method: 'GET',
  286 |         url: '{{BASE_URL}}/get?missing={{MISSING_VAR}}',
  287 |         headers: {
  288 |           'X-Missing-Header': '{{MISSING_HEADER}}',
  289 |         },
  290 |       });
  291 |
  292 |       const request = await api.post('/requests', requestData);
  293 |       validateApiResponse(request);
  294 |       createdRequestIds.push(request.data.id);
  295 |
  296 |       // Execute request - missing variables should remain as-is
  297 |       const execution = await api.post(`/requests/${request.data.id}/execute`);
  298 |       validateApiResponse(execution);
  299 |
  300 |       expect(execution.data.statusCode).toBe(200);
  301 |
  302 |       const responseBody = JSON.parse(execution.data.body);
> 303 |       expect(responseBody.url).toBe('https://httpbin.org/get?missing={{MISSING_VAR}}');
      |                                ^ Error: expect(received).toBe(expected) // Object.is equality
  304 |       expect(responseBody.headers).toHaveProperty('X-Missing-Header', '{{MISSING_HEADER}}');
  305 |     });
  306 |   });
  307 |
  308 |   test.describe('Cross-Module Data Consistency', () => {
  309 |     test('should maintain data consistency across modules', async () => {
  310 |       // Create workspace
  311 |       const workspace = await api.post('/workspaces', TestDataFactory.createWorkspace());
  312 |       validateApiResponse(workspace);
  313 |       createdWorkspaceIds.push(workspace.data.id);
  314 |
  315 |       // Create collection in workspace
  316 |       const collection = await api.post('/collections', TestDataFactory.createCollection({
  317 |         workspaceId: workspace.data.id,
  318 |       }));
  319 |       validateApiResponse(collection);
  320 |       createdCollectionIds.push(collection.data.id);
  321 |
  322 |       // Create request in collection
  323 |       const request = await api.post('/requests', TestDataFactory.createRequest({
  324 |         collectionId: collection.data.id,
  325 |       }));
  326 |       validateApiResponse(request);
  327 |       createdRequestIds.push(request.data.id);
  328 |
  329 |       // Create environment in workspace
  330 |       const environment = await api.post('/environments', TestDataFactory.createEnvironment({
  331 |         workspaceId: workspace.data.id,
  332 |       }));
  333 |       validateApiResponse(environment);
  334 |       createdEnvironmentIds.push(environment.data.id);
  335 |
  336 |       // Verify relationships
  337 |       const workspaceCollections = await api.get(`/collections/workspace/${workspace.data.id}`);
  338 |       validateApiResponse(workspaceCollections);
  339 |       expect(workspaceCollections.data).toHaveLength(1);
  340 |       expect(workspaceCollections.data[0].id).toBe(collection.data.id);
  341 |
  342 |       const collectionRequests = await api.get(`/requests/collection/${collection.data.id}`);
  343 |       validateApiResponse(collectionRequests);
  344 |       expect(collectionRequests.data).toHaveLength(1);
  345 |       expect(collectionRequests.data[0].id).toBe(request.data.id);
  346 |
  347 |       const workspaceEnvironments = await api.get(`/environments/workspace/${workspace.data.id}`);
  348 |       validateApiResponse(workspaceEnvironments);
  349 |       expect(workspaceEnvironments.data).toHaveLength(1);
  350 |       expect(workspaceEnvironments.data[0].id).toBe(environment.data.id);
  351 |
  352 |       // Delete workspace and verify cascade behavior
  353 |       await api.delete(`/workspaces/${workspace.data.id}`);
  354 |
  355 |       // Verify workspace is deleted
  356 |       await api.expectError(`/workspaces/${workspace.data.id}`, 'GET', undefined, 404);
  357 |
  358 |       // Check if related entities still exist (depends on your cascade implementation)
  359 |       // This test might need adjustment based on your actual cascade behavior
  360 |     });
  361 |   });
  362 |
  363 |   test.describe('Performance and Stress Testing', () => {
  364 |     test('should handle multiple concurrent requests', async () => {
  365 |       // Create multiple requests concurrently
  366 |       const promises = Array.from({ length: 10 }, (_, i) =>
  367 |         api.post('/workspaces', TestDataFactory.createWorkspace({
  368 |           name: `Concurrent Workspace ${i}`,
  369 |         }))
  370 |       );
  371 |
  372 |       const results = await Promise.all(promises);
  373 |
  374 |       results.forEach(result => {
  375 |         validateApiResponse(result);
  376 |         createdWorkspaceIds.push(result.data.id);
  377 |       });
  378 |
  379 |       expect(results).toHaveLength(10);
  380 |
  381 |       // Verify all workspaces were created
  382 |       const allWorkspaces = await api.get('/workspaces');
  383 |       validateApiResponse(allWorkspaces);
  384 |
  385 |       const createdNames = results.map(r => r.data.name);
  386 |       const fetchedNames = allWorkspaces.data.map((w: any) => w.name);
  387 |
  388 |       createdNames.forEach(name => {
  389 |         expect(fetchedNames).toContain(name);
  390 |       });
  391 |     });
  392 |
  393 |     test('should handle rapid request execution', async () => {
  394 |       // Create a simple request
  395 |       const requestData = TestDataFactory.createRequest({
  396 |         method: 'GET',
  397 |         url: 'https://httpbin.org/delay/0.1', // Small delay to simulate real API
  398 |       });
  399 |
  400 |       const request = await api.post('/requests', requestData);
  401 |       validateApiResponse(request);
  402 |       createdRequestIds.push(request.data.id);
  403 |
```