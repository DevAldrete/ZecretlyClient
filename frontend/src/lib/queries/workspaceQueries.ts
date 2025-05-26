import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api-client';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // Assuming timestamp is a string in ISO format
  updatedAt: string; // Assuming timestamp is a string in ISO format
}

interface ApiListResponse {
  success: boolean;
  data: Workspace[];
  message: string;
}

interface ApiSingleResponse {
  success: boolean;
  data: Workspace;
  message: string;
}

export const useWorkspaces = () => {
  return useQuery<Workspace[], Error>({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await api.get<ApiListResponse>('/workspaces');
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch workspaces');
      }
      return response.data;
    },
  });
};

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
}

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation<Workspace, Error, CreateWorkspacePayload>({
    mutationFn: async (newWorkspace) => {
      const response = await api.post<ApiSingleResponse>('/workspaces', newWorkspace);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create workspace');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};
