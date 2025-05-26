import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api-client';

export interface Collection {
  id: string;
  workspaceId?: string;
  name: string;
  description?: string;
  createdAt: string; // Assuming timestamp is a string in ISO format
  updatedAt: string; // Assuming timestamp is a string in ISO format
}

interface ApiCollectionListResponse {
  success: boolean;
  data: Collection[];
  message: string;
}

interface ApiCollectionSingleResponse {
  success: boolean;
  data: Collection;
  message: string;
}

export const useCollectionsByWorkspace = (workspaceId: string | null | undefined) => {
  return useQuery<Collection[], Error>({
    queryKey: ['collections', workspaceId],
    queryFn: async () => {
      if (!workspaceId) {
        return []; 
      }
      const response = await api.get<ApiCollectionListResponse>(`/collections/workspace/${workspaceId}`);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch collections');
      }
      return response.data;
    },
    enabled: !!workspaceId,
  });
};

export interface CreateCollectionPayload {
  name: string;
  description?: string;
  workspaceId: string;
}

export const useCreateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation<Collection, Error, CreateCollectionPayload>({
    mutationFn: async (newCollection) => {
      const response = await api.post<ApiCollectionSingleResponse>('/collections', newCollection);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create collection');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // data here is the response from the mutation, which is the created collection
      // We need to invalidate based on the workspaceId of the created collection
      if (data.workspaceId) {
        queryClient.invalidateQueries({ queryKey: ['collections', data.workspaceId] });
      } else {
        // Fallback if workspaceId is not in the response, though it should be.
        // This might lead to broader invalidation or require a different strategy.
        queryClient.invalidateQueries({ queryKey: ['collections'] });
      }
    },
  });
};
