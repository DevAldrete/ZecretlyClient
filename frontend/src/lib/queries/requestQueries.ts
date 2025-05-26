import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api-client';

// Based on backend/API_ENDPOINTS.md
export interface RequestModel { // Renamed to RequestModel to avoid conflict with DOM Request type
  id: string; // UUID
  collectionId?: string; // UUID
  name: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  url: string;
  headers?: Record<string, string>;
  bodyType?: "none" | "json" | "form-data" | "x-www-form-urlencoded" | "raw" | "binary";
  bodyContent?: string;
  response?: string; // This likely won't be part of a simple list display
  queryParams?: Record<string, string>;
  authType?: "none" | "bearer" | "basic" | "api-key" | "oauth2";
  authDetails?: Record<string, any>;
  preRequestScript?: string;
  postRequestScript?: string;
  sortOrder?: number;
  status: number; // HTTP status code, might not be in list view
  description?: string;
  createdAt: string; // timestamp
  updatedAt: string; // timestamp
}

interface ApiRequestListResponse {
  success: boolean;
  data: RequestModel[];
  message: string;
}

interface ApiRequestSingleResponse {
  success: boolean;
  data: RequestModel;
  message: string;
}

export const useRequestsByCollection = (collectionId: string | null | undefined) => {
  return useQuery<RequestModel[], Error>({
    queryKey: ['requests', collectionId],
    queryFn: async () => {
      if (!collectionId) {
        return []; 
      }
      const response = await api.get<ApiRequestListResponse>(`/requests/collection/${collectionId}`);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch requests');
      }
      return response.data;
    },
    enabled: !!collectionId, 
  });
};

export const useRequestById = (requestId: string | null | undefined) => {
  return useQuery<RequestModel, Error>({
    queryKey: ['request', requestId],
    queryFn: async () => {
      if (!requestId) {
        // Should not happen if 'enabled' is working, but good for type safety
        throw new Error("Attempted to fetch request without ID.");
      }
      const response = await api.get<ApiRequestSingleResponse>(`/requests/${requestId}`);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch request details');
      }
      return response.data;
    },
    enabled: !!requestId, // Query will only run if requestId is truthy
  });
};

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export interface CreateRequestPayload {
  name: string;
  method: HttpMethod;
  collectionId: string;
  url: string; // Default or user-provided
  // Add other optional fields as needed for creation, keeping it simple for now
  bodyType?: "none" | "json" | "form-data" | "x-www-form-urlencoded" | "raw" | "binary";
  bodyContent?: string;
  description?: string;
  // Ensure 'status' is not part of CreateRequestPayload unless intended
}

export const useCreateRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<RequestModel, Error, CreateRequestPayload>({
    mutationFn: async (newRequest) => {
      const response = await api.post<ApiRequestSingleResponse>('/requests', newRequest);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create request');
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (data.collectionId) {
        queryClient.invalidateQueries({ queryKey: ['requests', data.collectionId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['requests'] });
      }
      queryClient.setQueryData(['request', data.id], data); // Pre-populate new request data
    },
  });
};

export interface UpdateRequestPayload {
  // All fields from RequestModel are optional for update, except 'id' which is part of variables
  name?: string;
  method?: HttpMethod;
  url?: string;
  headers?: Record<string, string>;
  bodyType?: "none" | "json" | "form-data" | "x-www-form-urlencoded" | "raw" | "binary";
  bodyContent?: string;
  queryParams?: Record<string, string>;
  authType?: "none" | "bearer" | "basic" | "api-key" | "oauth2";
  authDetails?: Record<string, any>;
  preRequestScript?: string;
  postRequestScript?: string;
  sortOrder?: number;
  status?: number;
  description?: string;
  // collectionId should generally not be updated directly via this, but through a "move request" feature
}

export const useUpdateRequest = () => {
  const queryClient = useQueryClient();

  return useMutation<RequestModel, Error, { id: string; data: UpdateRequestPayload }>({
    mutationFn: async (variables) => {
      const response = await api.put<ApiRequestSingleResponse>(`/requests/${variables.id}`, variables.data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update request');
      }
      return response.data;
    },
    onSuccess: (updatedRequestData) => {
      // Invalidate and refetch the specific request
      queryClient.invalidateQueries({ queryKey: ['request', updatedRequestData.id] });
      // Update the cache directly with the new data
      queryClient.setQueryData(['request', updatedRequestData.id], updatedRequestData);

      // Invalidate the list of requests for the collection
      if (updatedRequestData.collectionId) {
        queryClient.invalidateQueries({ queryKey: ['requests', updatedRequestData.collectionId] });
      } else {
        // If collectionId is somehow not present, might need a broader invalidation
        queryClient.invalidateQueries({ queryKey: ['requests'] });
      }
    },
  });
};

// Basic definition for useExecuteRequest as it's used in RequestEditor
// The actual response type for executeRequest might be different (e.g., not ApiRequestSingleResponse)
// For now, using `any` for simplicity as it's not the main focus.
interface ExecuteRequestResponse {
  success: boolean;
  data: any; // This could be structured response data, logs, etc.
  message: string;
}
export const useExecuteRequest = () => {
  // const queryClient = useQueryClient(); // May not need queryClient if not invalidating/caching specific things
  return useMutation<ExecuteRequestResponse, Error, { id: string; data?: any }>({
    mutationFn: async (variables) => {
      const response = await api.post<ExecuteRequestResponse>(`/requests/${variables.id}/execute`, variables.data || {});
      if (!response.success) {
        throw new Error(response.message || 'Failed to execute request');
      }
      return response; // Return the whole response including success status and data
    },
    // onSuccess: (data) => {
    //   // Handle success, e.g., update request history, show notifications
    //   // console.log("Execution successful", data);
    //   // Potentially invalidate request history queries here
    // }
  });
};
