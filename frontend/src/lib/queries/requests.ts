// React Query hooks for requests
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api-client';
import { Request, CreateRequestInput, ExecuteRequestInput, RequestExecution } from '../types';

export const requestKeys = {
  all: ['requests'] as const,
  lists: () => [...requestKeys.all, 'list'] as const,
  list: (filters: string) => [...requestKeys.lists(), { filters }] as const,
  details: () => [...requestKeys.all, 'detail'] as const,
  detail: (id: string) => [...requestKeys.details(), id] as const,
  byCollection: (collectionId: string) => [...requestKeys.all, 'collection', collectionId] as const,
  executions: (requestId: string) => [...requestKeys.all, 'executions', requestId] as const,
};

export function useRequests() {
  return useQuery({
    queryKey: requestKeys.lists(),
    queryFn: () => api.get<Request[]>('/requests'),
  });
}

export function useRequest(id: string) {
  return useQuery({
    queryKey: requestKeys.detail(id),
    queryFn: () => api.get<Request>(`/requests/${id}`),
    enabled: !!id,
  });
}

export function useRequestsByCollection(collectionId: string) {
  return useQuery({
    queryKey: requestKeys.byCollection(collectionId),
    queryFn: () => api.get<Request[]>(`/requests/collection/${collectionId}`),
    enabled: !!collectionId,
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRequestInput) =>
      api.post<Request>('/requests', data),
    onSuccess: (newRequest: Request) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      if (newRequest.collectionId) {
        queryClient.invalidateQueries({
          queryKey: requestKeys.byCollection(newRequest.collectionId)
        });
      }
    },
  });
}

export function useUpdateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRequestInput> }) =>
      api.put<Request>(`/requests/${id}`, data),
    onSuccess: (updatedRequest: Request, { id }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
      if (updatedRequest.collectionId) {
        queryClient.invalidateQueries({
          queryKey: requestKeys.byCollection(updatedRequest.collectionId)
        });
      }
    },
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/requests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
    },
  });
}

export function useExecuteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ExecuteRequestInput }) =>
      api.post<RequestExecution>(`/requests/${id}/execute`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.executions(id) });
    },
  });
}

export function useFindSimilarRequests() {
  return useMutation({
    mutationFn: (searchParams: { url?: string; method?: string }) =>
      api.get<Request[]>(`/requests/search?${new URLSearchParams(searchParams)}`),
  });
}
