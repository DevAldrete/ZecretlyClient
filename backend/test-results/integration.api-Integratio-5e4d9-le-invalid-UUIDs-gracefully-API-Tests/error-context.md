# Test info

- Name: Integration Tests - Complete Workflows >> Error Handling and Edge Cases >> should handle invalid UUIDs gracefully
- Location: /home/aldrete/programming/ZecretlyClient/backend/tests/integration.api.spec.ts:420:9

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 200
    at ApiTestHelper.expectError (/home/aldrete/programming/ZecretlyClient/backend/tests/utils/test-helpers.ts:88:31)
    at /home/aldrete/programming/ZecretlyClient/backend/tests/integration.api.spec.ts:430:9
```

# Test source

```ts
   1 | import { APIRequestContext, expect } from '@playwright/test';
   2 |
   3 | export interface ApiResponse<T = any> {
   4 |   success: boolean;
   5 |   data?: T;
   6 |   message: string;
   7 | }
   8 |
   9 | export class ApiTestHelper {
   10 |   constructor(private request: APIRequestContext) {}
   11 |
   12 |   async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
   13 |     const response = await this.request.get(`/api${endpoint}`);
   14 |     expect(response.ok()).toBeTruthy();
   15 |     return await response.json();
   16 |   }
   17 |
   18 |   async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
   19 |     const response = await this.request.post(`/api${endpoint}`, {
   20 |       data: data,
   21 |       headers: {
   22 |         'Content-Type': 'application/json',
   23 |       },
   24 |     });
   25 |     expect(response.ok()).toBeTruthy();
   26 |     return await response.json();
   27 |   }
   28 |
   29 |   async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
   30 |     const response = await this.request.put(`/api${endpoint}`, {
   31 |       data: data,
   32 |       headers: {
   33 |         'Content-Type': 'application/json',
   34 |       },
   35 |     });
   36 |     expect(response.ok()).toBeTruthy();
   37 |     return await response.json();
   38 |   }
   39 |
   40 |   async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
   41 |     const response = await this.request.patch(`/api${endpoint}`, {
   42 |       data: data,
   43 |       headers: {
   44 |         'Content-Type': 'application/json',
   45 |       },
   46 |     });
   47 |     expect(response.ok()).toBeTruthy();
   48 |     return await response.json();
   49 |   }
   50 |
   51 |   async delete<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
   52 |     const response = await this.request.delete(`/api${endpoint}`, {
   53 |       data: data,
   54 |       headers: data ? { 'Content-Type': 'application/json' } : undefined,
   55 |     });
   56 |     expect(response.ok()).toBeTruthy();
   57 |     return await response.json();
   58 |   }
   59 |
   60 |   async deleteWithBody<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
   61 |     const response = await this.request.delete(`/api${endpoint}`, {
   62 |       data: data,
   63 |       headers: { 'Content-Type': 'application/json' }
   64 |     });
   65 |     expect(response.ok()).toBeTruthy();
   66 |     return await response.json();
   67 |   }
   68 |
   69 |   async expectError(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', data?: any, expectedStatus = 400) {
   70 |     let response;
   71 |     switch (method) {
   72 |       case 'GET':
   73 |         response = await this.request.get(`/api${endpoint}`);
   74 |         break;
   75 |       case 'POST':
   76 |         response = await this.request.post(`/api${endpoint}`, { data });
   77 |         break;
   78 |       case 'PUT':
   79 |         response = await this.request.put(`/api${endpoint}`, { data });
   80 |         break;
   81 |       case 'DELETE':
   82 |         response = await this.request.delete(`/api${endpoint}`);
   83 |         break;
   84 |       case 'PATCH':
   85 |         response = await this.request.patch(`/api${endpoint}`, { data });
   86 |         break;
   87 |     }
>  88 |     expect(response.status()).toBe(expectedStatus);
      |                               ^ Error: expect(received).toBe(expected) // Object.is equality
   89 |     return await response.json();
   90 |   }
   91 | }
   92 |
   93 | export function validateApiResponse<T>(response: ApiResponse<T>, expectSuccess = true, expectData = true) {
   94 |   expect(response).toHaveProperty('success');
   95 |   expect(response).toHaveProperty('message');
   96 |   expect(response.success).toBe(expectSuccess);
   97 |
   98 |   if (expectSuccess && expectData) {
   99 |     expect(response).toHaveProperty('data');
  100 |   }
  101 | }
  102 |
  103 | export function validateUUID(uuid: string) {
  104 |   const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  105 |   expect(uuid).toMatch(uuidRegex);
  106 | }
  107 |
  108 | export function validateTimestamp(timestamp: string) {
  109 |   const date = new Date(timestamp);
  110 |   expect(date.getTime()).not.toBeNaN();
  111 |   expect(date.toISOString()).toBe(timestamp);
  112 | }
  113 |
```