import { RequestRepository } from "./requests.repository";
import { CreateRequestInput, UpdateRequestBody } from "./requests.schemas";
import { EnvironmentService } from "../environments/environments.service";

export class RequestService {
  private requestRepository: RequestRepository;
  private environmentService: EnvironmentService;

  constructor() {
    this.requestRepository = new RequestRepository();
    this.environmentService = new EnvironmentService();
  }

  async getAllRequests() {
    try {
      return await this.requestRepository.findAll();
    } catch (error) {
      throw new Error(`Failed to fetch requests: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRequestById(id: string) {
    try {
      const request = await this.requestRepository.findById(id);
      if (!request) {
        throw new Error("Request not found");
      }
      return request;
    } catch (error) {
      if (error instanceof Error && error.message === "Request not found") {
        throw error;
      }
      throw new Error(`Failed to fetch request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRequestsByCollectionId(collectionId: string) {
    try {
      return await this.requestRepository.findByCollectionId(collectionId);
    } catch (error) {
      throw new Error(`Failed to fetch requests for collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createRequest(data: CreateRequestInput) {
    try {
      // Validate that collection exists if collectionId is provided
      if (data.collectionId) {
        // This would ideally check if collection exists
        // For now, we'll trust the foreign key constraint
      }

      return await this.requestRepository.create(data);
    } catch (error) {
      throw new Error(`Failed to create request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateRequest(id: string, data: UpdateRequestBody) {
    try {
      // Check if request exists
      const existingRequest = await this.requestRepository.findById(id);
      if (!existingRequest) {
        throw new Error("Request not found");
      }

      return await this.requestRepository.update(id, data);
    } catch (error) {
      if (error instanceof Error && error.message === "Request not found") {
        throw error;
      }
      throw new Error(`Failed to update request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteRequest(id: string) {
    try {
      const existingRequest = await this.requestRepository.findById(id);
      if (!existingRequest) {
        throw new Error("Request not found");
      }

      return await this.requestRepository.deleteById(id);
    } catch (error) {
      if (error instanceof Error && error.message === "Request not found") {
        throw error;
      }
      throw new Error(`Failed to delete request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateRequestSortOrder(id: string, sortOrder: number) {
    try {
      const existingRequest = await this.requestRepository.findById(id);
      if (!existingRequest) {
        throw new Error("Request not found");
      }

      return await this.requestRepository.updateSortOrder(id, sortOrder);
    } catch (error) {
      if (error instanceof Error && error.message === "Request not found") {
        throw error;
      }
      throw new Error(`Failed to update request sort order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findSimilarRequests(method: string, url: string) {
    try {
      return await this.requestRepository.findByMethodAndUrl(method, url);
    } catch (error) {
      throw new Error(`Failed to find similar requests: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async executeRequest(id: string, overrides?: {
    url?: string;
    headers?: Record<string, string>;
    body?: string;
    environmentId?: string;
  }) {
    try {
      const request = await this.requestRepository.findById(id);
      if (!request) {
        throw new Error("Request not found");
      }

      const startTime = Date.now();

      // Resolve variables if environment is available
      let resolvedUrl = overrides?.url || request.url;
      let resolvedHeaders = { ...(request.headers || {}), ...(overrides?.headers || {}) };
      let resolvedBody = overrides?.body || request.bodyContent;

      // Try to resolve variables from environment
      let environmentId = overrides?.environmentId;

      // If no environment ID provided, try to find an active environment
      // For now, we'll look for any active environment (in a real app, this would be workspace-specific)
      if (!environmentId && (resolvedUrl.includes('{{') || JSON.stringify(resolvedHeaders).includes('{{'))) {
        try {
          // This is a simplified approach - in a real app, you'd get the workspace from the request/collection
          // and find the active environment for that workspace
          const environments = await this.environmentService.getAllEnvironments();
          const activeEnvironments = environments.filter(env => env.isActive);

          if (activeEnvironments.length > 0) {
            // Use the most recently created active environment
            const mostRecentEnv = activeEnvironments.sort((a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0];
            environmentId = mostRecentEnv.id;
          }
        } catch (error) {
          console.warn('Failed to find active environment:', error);
        }
      }

      if (environmentId) {
        try {
          resolvedUrl = await this.environmentService.resolveVariables(environmentId, resolvedUrl);

          // Resolve variables in headers
          const resolvedHeaderEntries = await Promise.all(
            Object.entries(resolvedHeaders).map(async ([key, value]) => [
              key,
              await this.environmentService.resolveVariables(environmentId!, String(value))
            ])
          );
          resolvedHeaders = Object.fromEntries(resolvedHeaderEntries);

          // Resolve variables in body if present
          if (resolvedBody) {
            resolvedBody = await this.environmentService.resolveVariables(environmentId, resolvedBody);
          }
        } catch (error) {
          // If variable resolution fails, continue with original values
          console.warn('Failed to resolve variables:', error);
        }
      }

      // This is a placeholder for actual HTTP request execution
      // In a real implementation, you would use a library like axios or fetch
      const finalUrl = resolvedUrl;
      const finalHeaders = resolvedHeaders;
      const finalBody = resolvedBody;

      // Add a small delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10 + 5)); // 5-15ms delay

      // Simulate different responses based on the request
      let statusCode = 200;
      let responseBody = JSON.stringify({ message: "Default response", url: finalUrl });

      if (request.method === 'POST' && finalUrl.includes('jsonplaceholder.typicode.com/posts')) {
        statusCode = 201;
        responseBody = JSON.stringify({
          id: 101,
          title: 'Test Post',
          body: 'This is a test post',
          userId: 1
        });
      } else if (finalUrl.includes('jsonplaceholder.typicode.com/posts/1')) {
        responseBody = JSON.stringify({
          id: 1,
          title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
          body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto',
          userId: 1
        });
      } else if (finalUrl.includes('jsonplaceholder.typicode.com/posts/2')) {
        responseBody = JSON.stringify({
          id: 2,
          title: 'qui est esse',
          body: 'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla',
          userId: 1
        });
      } else if (finalUrl.includes('httpbin.org/headers')) {
        responseBody = JSON.stringify({
          headers: finalHeaders
        });
      } else if (finalUrl.includes('httpbin.org/get')) {
        responseBody = JSON.stringify({
          url: finalUrl,
          headers: finalHeaders,
          args: {}
        });
      } else if (finalUrl.includes('httpbin.org/delay')) {
        responseBody = JSON.stringify({
          url: finalUrl,
          headers: finalHeaders,
          args: {},
          origin: "127.0.0.1"
        });
      } else if (finalUrl.includes('httpbin.org/post')) {
        responseBody = JSON.stringify({
          url: finalUrl,
          headers: finalHeaders,
          json: finalBody ? JSON.parse(finalBody) : null,
          args: {}
        });
      } else if (finalUrl.includes('jsonplaceholder.typicode.com/users/1')) {
        responseBody = JSON.stringify({
          id: 1,
          name: 'Leanne Graham',
          username: 'Bret',
          email: 'Sincere@april.biz',
          address: {
            street: 'Kulas Light',
            suite: 'Apt. 556',
            city: 'Gwenborough',
            zipcode: '92998-3874',
            geo: {
              lat: '-37.3159',
              lng: '81.1496'
            }
          },
          phone: '1-770-736-8031 x56442',
          website: 'hildegard.org',
          company: {
            name: 'Romaguera-Crona',
            catchPhrase: 'Multi-layered client-server neural-net',
            bs: 'harness real-time e-markets'
          }
        });
      }

      const endTime = Date.now();
      const durationMs = endTime - startTime;

      const executionResult = {
        requestId: id,
        method: request.method,
        url: finalUrl,
        headers: finalHeaders,
        body: responseBody, // This should be the response body, not the request body
        requestBody: finalBody, // Store the request body separately
        statusCode,
        durationMs,
        timestamp: new Date().toISOString(),
        // Keep the nested response for backward compatibility
        response: {
          status: statusCode,
          statusText: statusCode === 200 ? "OK" : statusCode === 201 ? "Created" : "OK",
          headers: {},
          body: responseBody,
          duration: durationMs
        }
      };

      return executionResult;
    } catch (error) {
      if (error instanceof Error && error.message === "Request not found") {
        throw error;
      }
      throw new Error(`Failed to execute request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
