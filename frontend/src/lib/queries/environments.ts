// React Query hooks for environments
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api-client';
import { Environment, CreateEnvironmentInput } from '../types';

export const environmentKeys = {
  all: ['environments'] as const,
  lists: () => [...environmentKeys.all, 'list'] as const,
  list: (filters: string) => [...environmentKeys.lists(), { filters }] as const,
  details: () => [...environmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...environmentKeys.details(), id] as const,
  byWorkspace: (workspaceId: string) => [...environmentKeys.all, 'workspace', workspaceId] as const,
  activeByWorkspace: (workspaceId: string) => [...environmentKeys.all, 'workspace', workspaceId, 'active'] as const,
};

export function useEnvironments() {
  return useQuery({
    queryKey: environmentKeys.lists(),
    queryFn: () => api.get<Environment[]>('/environments'),
  });
}

export function useEnvironment(id: string) {
  return useQuery({
    queryKey: environmentKeys.detail(id),
    queryFn: () => api.get<Environment>(`/environments/${id}`),
    enabled: !!id,
  });
}

export function useEnvironmentsByWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: environmentKeys.byWorkspace(workspaceId),
    queryFn: () => api.get<Environment[]>(`/environments/workspace/${workspaceId}`),
    enabled: !!workspaceId,
  });
}

export function useActiveEnvironmentByWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: environmentKeys.activeByWorkspace(workspaceId),
    queryFn: () => api.get<Environment>(`/environments/workspace/${workspaceId}/active`),
    enabled: !!workspaceId,
  });
}

export function useCreateEnvironment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEnvironmentInput) =>
      api.post<Environment>('/environments', data),
    onSuccess: (newEnvironment: Environment) => {
      queryClient.invalidateQueries({ queryKey: environmentKeys.lists() });
      if (newEnvironment.workspaceId) {
        queryClient.invalidateQueries({
          queryKey: environmentKeys.byWorkspace(newEnvironment.workspaceId)
        });
      }
    },
  });
}

export function useUpdateEnvironment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEnvironmentInput> }) =>
      api.put<Environment>(`/environments/${id}`, data),
    onSuccess: (updatedEnvironment: Environment, { id }) => {
      queryClient.invalidateQueries({ queryKey: environmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: environmentKeys.lists() });
      if (updatedEnvironment.workspaceId) {
        queryClient.invalidateQueries({
          queryKey: environmentKeys.byWorkspace(updatedEnvironment.workspaceId)
        });
      }
    },
  });
}

export function useDeleteEnvironment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/environments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: environmentKeys.lists() });
    },
  });
}

export function useActivateEnvironment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.post(`/environments/${id}/activate`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: environmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: environmentKeys.lists() });
    },
  });
}

export function useUpdateEnvironmentVariable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, key, value }: { id: string; key: string; value: string }) =>
      api.put(`/environments/${id}/variables`, { key, value }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: environmentKeys.detail(id) });
    },
  });
}

export function useResolveVariables() {
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      api.post<{ resolved: string }>(`/environments/${id}/resolve`, { text }),
  });
}
