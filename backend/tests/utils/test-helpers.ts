import { APIRequestContext, expect } from '@playwright/test';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
}

export class ApiTestHelper {
  constructor(private request: APIRequestContext) {}

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await this.request.get(`/api${endpoint}`);
    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.request.post(`/api${endpoint}`, {
      data: data,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.request.put(`/api${endpoint}`, {
      data: data,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.request.patch(`/api${endpoint}`, {
      data: data,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  async delete<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.request.delete(`/api${endpoint}`, {
      data: data,
      headers: data ? { 'Content-Type': 'application/json' } : undefined,
    });
    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  async deleteWithBody<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const response = await this.request.delete(`/api${endpoint}`, {
      data: data,
      headers: { 'Content-Type': 'application/json' }
    });
    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  async expectError(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', data?: any, expectedStatus = 400) {
    let response;
    switch (method) {
      case 'GET':
        response = await this.request.get(`/api${endpoint}`);
        break;
      case 'POST':
        response = await this.request.post(`/api${endpoint}`, { data });
        break;
      case 'PUT':
        response = await this.request.put(`/api${endpoint}`, { data });
        break;
      case 'DELETE':
        response = await this.request.delete(`/api${endpoint}`);
        break;
      case 'PATCH':
        response = await this.request.patch(`/api${endpoint}`, { data });
        break;
    }
    expect(response.status()).toBe(expectedStatus);
    return await response.json();
  }
}

export function validateApiResponse<T>(response: ApiResponse<T>, expectSuccess = true, expectData = true) {
  expect(response).toHaveProperty('success');
  expect(response).toHaveProperty('message');
  expect(response.success).toBe(expectSuccess);

  if (expectSuccess && expectData) {
    expect(response).toHaveProperty('data');
  }
}

export function validateUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  expect(uuid).toMatch(uuidRegex);
}

export function validateTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  expect(date.getTime()).not.toBeNaN();
  expect(date.toISOString()).toBe(timestamp);
}
