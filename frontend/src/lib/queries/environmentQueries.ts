import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api-client';

export interface Environment {
  id: string; // UUID
  workspaceId?: string; // UUID
  name: string;
  variables?: Record<string, string>;
  isActive?: boolean;
  createdAt: string; // timestamp, from API_ENDPOINTS.md (though not explicitly requested for type)
  updatedAt: string; // timestamp, from API_ENDPOINTS.md (though not explicitly requested for type)
}

// For responses that list multiple environments
interface ApiEnvironmentListResponse {
  success: boolean;
  data: Environment[];
  message: string;
}

// For responses that return a single environment (like the active one)
interface ApiEnvironmentSingleResponse {
  success: boolean;
  data: Environment | null; // Active environment can be null if none is active
  message: string;
}

export const useEnvironmentsByWorkspace = (workspaceId: string | null | undefined) => {
  return useQuery<Environment[], Error>({
    queryKey: ['environments', workspaceId],
    queryFn: async () => {
      if (!workspaceId) {
        return []; 
      }
      const response = await api.get<ApiEnvironmentListResponse>(`/environments/workspace/${workspaceId}`);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch environments for workspace');
      }
      return response.data;
    },
    enabled: !!workspaceId, 
  });
};

export const useActiveEnvironment = (workspaceId: string | null | undefined) => {
  return useQuery<Environment | null, Error>({
    queryKey: ['environments', workspaceId, 'active'],
    queryFn: async () => {
      if (!workspaceId) {
        return null;
      }
      // Assuming the backend returns a single environment object or null/empty if no active one
      const response = await api.get<ApiEnvironmentSingleResponse>(`/environments/workspace/${workspaceId}/active`);
      if (!response.success) {
        // It's possible an error means "no active environment" vs. a true server error.
        // For now, treat all non-success as errors. Backend might return success:true, data:null for no active env.
        throw new Error(response.message || 'Failed to fetch active environment');
      }
      return response.data; // This could be null if no environment is active and API returns data: null
    },
    enabled: !!workspaceId,
  });
};

export interface CreateEnvironmentPayload {
  name: string;
  workspaceId: string;
  variables?: Record<string, string>;
}

export const useCreateEnvironment = () => {
  const queryClient = useQueryClient();
  return useMutation<Environment, Error, CreateEnvironmentPayload>({
    mutationFn: async (newEnvironment) => {
      const response = await api.post<ApiEnvironmentSingleResponse>('/environments', newEnvironment);
      if (!response.success || !response.data) { // Ensure data is not null
        throw new Error(response.message || 'Failed to create environment');
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (data.workspaceId) {
        queryClient.invalidateQueries({ queryKey: ['environments', data.workspaceId] });
      }
    },
  });
};

export const useActivateEnvironment = () => {
  const queryClient = useQueryClient();
  // The backend API for activate returns the activated environment.
  return useMutation<Environment, Error, { environmentId: string, workspaceId: string | null | undefined }>({
    mutationFn: async ({ environmentId }) => {
      const response = await api.post<ApiEnvironmentSingleResponse>(`/environments/${environmentId}/activate`);
      if (!response.success || !response.data) { // Ensure data is not null
        throw new Error(response.message || 'Failed to activate environment');
      }
      return response.data;
    },
    onSuccess: (activatedEnvironment, variables) => {
      if (variables.workspaceId) {
        // Update the active environment query
        queryClient.setQueryData(['environments', variables.workspaceId, 'active'], activatedEnvironment);
        // Invalidate the list of environments for the workspace to update isActive flags
        queryClient.invalidateQueries({ queryKey: ['environments', variables.workspaceId] });
      }
    },
  });
};
