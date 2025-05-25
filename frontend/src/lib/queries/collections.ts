// React Query hooks for collections
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api-client';
import { Collection, CreateCollectionInput } from '../types';

export const collectionKeys = {
  all: ['collections'] as const,
  lists: () => [...collectionKeys.all, 'list'] as const,
  list: (filters: string) => [...collectionKeys.lists(), { filters }] as const,
  details: () => [...collectionKeys.all, 'detail'] as const,
  detail: (id: string) => [...collectionKeys.details(), id] as const,
  byWorkspace: (workspaceId: string) => [...collectionKeys.all, 'workspace', workspaceId] as const,
};

export function useCollections() {
  return useQuery({
    queryKey: collectionKeys.lists(),
    queryFn: () => api.get<Collection[]>('/collections'),
  });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: collectionKeys.detail(id),
    queryFn: () => api.get<Collection>(`/collections/${id}`),
    enabled: !!id,
  });
}

export function useCollectionsByWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: collectionKeys.byWorkspace(workspaceId),
    queryFn: () => api.get<Collection[]>(`/collections/workspace/${workspaceId}`),
    enabled: !!workspaceId,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCollectionInput) =>
      api.post<Collection>('/collections', data),
    onSuccess: (newCollection: Collection) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
      if (newCollection.workspaceId) {
        queryClient.invalidateQueries({
          queryKey: collectionKeys.byWorkspace(newCollection.workspaceId)
        });
      }
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCollectionInput> }) =>
      api.put<Collection>(`/collections/${id}`, data),
    onSuccess: (updatedCollection: Collection, { id }) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
      if (updatedCollection.workspaceId) {
        queryClient.invalidateQueries({
          queryKey: collectionKeys.byWorkspace(updatedCollection.workspaceId)
        });
      }
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/collections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}
