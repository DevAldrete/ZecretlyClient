# Test info

- Name: Integration Tests - Complete Workflows >> Complete API Testing Workflow >> should create workspace, collection, environment, and execute requests with variable resolution
- Location: /home/aldrete/programming/ZecretlyClient/backend/tests/integration.api.spec.ts:67:9

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "Test Post from 1"
Received string:    "Test Post"
    at /home/aldrete/programming/ZecretlyClient/backend/tests/integration.api.spec.ts:198:41
```

# Test source

```ts
   98 |         workspaceId: workspace.data.id,
   99 |         name: 'JSONPlaceholder API Collection',
  100 |         description: 'Collection for testing JSONPlaceholder API',
  101 |       });
  102 |
  103 |       const collection = await api.post('/collections', collectionData);
  104 |       validateApiResponse(collection);
  105 |       createdCollectionIds.push(collection.data.id);
  106 |
  107 |       // Step 4: Create requests with environment variables
  108 |       const getPostRequest = TestDataFactory.createRequest({
  109 |         collectionId: collection.data.id,
  110 |         name: 'Get Post by ID',
  111 |         method: 'GET',
  112 |         url: '{{BASE_URL}}/posts/{{POST_ID}}',
  113 |         headers: {
  114 |           'Authorization': 'Bearer {{AUTH_TOKEN}}',
  115 |           'Content-Type': 'application/json',
  116 |         },
  117 |         sortOrder: 1,
  118 |       });
  119 |
  120 |       const getUserRequest = TestDataFactory.createRequest({
  121 |         collectionId: collection.data.id,
  122 |         name: 'Get User by ID',
  123 |         method: 'GET',
  124 |         url: '{{BASE_URL}}/users/{{USER_ID}}',
  125 |         headers: {
  126 |           'Authorization': 'Bearer {{AUTH_TOKEN}}',
  127 |         },
  128 |         sortOrder: 2,
  129 |       });
  130 |
  131 |       const createPostRequest = TestDataFactory.createPostRequest({
  132 |         collectionId: collection.data.id,
  133 |         name: 'Create New Post',
  134 |         url: '{{BASE_URL}}/posts',
  135 |         headers: {
  136 |           'Authorization': 'Bearer {{AUTH_TOKEN}}',
  137 |           'Content-Type': 'application/json',
  138 |         },
  139 |         bodyContent: JSON.stringify({
  140 |           title: 'Test Post from {{USER_ID}}',
  141 |           body: 'This is a test post created via API',
  142 |           userId: '{{USER_ID}}',
  143 |         }),
  144 |         sortOrder: 3,
  145 |       });
  146 |
  147 |       const createdGetPost = await api.post('/requests', getPostRequest);
  148 |       const createdGetUser = await api.post('/requests', getUserRequest);
  149 |       const createdCreatePost = await api.post('/requests', createPostRequest);
  150 |
  151 |       validateApiResponse(createdGetPost);
  152 |       validateApiResponse(createdGetUser);
  153 |       validateApiResponse(createdCreatePost);
  154 |
  155 |       createdRequestIds.push(
  156 |         createdGetPost.data.id,
  157 |         createdGetUser.data.id,
  158 |         createdCreatePost.data.id
  159 |       );
  160 |
  161 |       // Step 5: Test variable resolution
  162 |       const textToResolve = {
  163 |         text: 'GET {{BASE_URL}}/{{API_VERSION}}/users/{{USER_ID}} with token {{AUTH_TOKEN}}',
  164 |       };
  165 |
  166 |       const resolvedResponse = await api.post(`/environments/${environment.data.id}/resolve`, textToResolve);
  167 |       validateApiResponse(resolvedResponse);
  168 |
  169 |       expect(resolvedResponse.data.resolvedText).toBe(
  170 |         'GET https://jsonplaceholder.typicode.com/v1/users/1 with token test-token-123'
  171 |       );
  172 |
  173 |       // Step 6: Execute requests and verify they work
  174 |       const getPostExecution = await api.post(`/requests/${createdGetPost.data.id}/execute`);
  175 |       validateApiResponse(getPostExecution);
  176 |
  177 |       expect(getPostExecution.data.statusCode).toBe(200);
  178 |       const postResponse = JSON.parse(getPostExecution.data.body);
  179 |       expect(postResponse).toHaveProperty('id', 1);
  180 |       expect(postResponse).toHaveProperty('title');
  181 |       expect(postResponse).toHaveProperty('body');
  182 |
  183 |       const getUserExecution = await api.post(`/requests/${createdGetUser.data.id}/execute`);
  184 |       validateApiResponse(getUserExecution);
  185 |
  186 |       expect(getUserExecution.data.statusCode).toBe(200);
  187 |       const userResponse = JSON.parse(getUserExecution.data.body);
  188 |       expect(userResponse).toHaveProperty('id', 1);
  189 |       expect(userResponse).toHaveProperty('name');
  190 |       expect(userResponse).toHaveProperty('email');
  191 |
  192 |       const createPostExecution = await api.post(`/requests/${createdCreatePost.data.id}/execute`);
  193 |       validateApiResponse(createPostExecution);
  194 |
  195 |       expect(createPostExecution.data.statusCode).toBe(201);
  196 |       const createdPostResponse = JSON.parse(createPostExecution.data.body);
  197 |       expect(createdPostResponse).toHaveProperty('id');
> 198 |       expect(createdPostResponse.title).toContain('Test Post from 1');
      |                                         ^ Error: expect(received).toContain(expected) // indexOf
  199 |
  200 |       // Step 7: Verify collections contain the requests
  201 |       const collectionRequests = await api.get(`/requests/collection/${collection.data.id}`);
  202 |       validateApiResponse(collectionRequests);
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
```