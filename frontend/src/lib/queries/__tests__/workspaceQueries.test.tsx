import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useWorkspaces } from '../workspaceQueries'; // Adjust path as necessary
import { server } from '../../../mocks/server'; // Adjust path as necessary
import { http, HttpResponse } from 'msw';

// Helper to create a QueryClient wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests for faster failures
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useWorkspaces', () => {
  test('should return a list of workspaces on successful fetch', async () => {
    const { result } = renderHook(() => useWorkspaces(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].name).toBe('Workspace 1');
    expect(result.current.data?.[1].name).toBe('Workspace 2');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  test('should return an empty list when no workspaces are found', async () => {
    server.use(
      http.get('/api/workspaces', () => {
        return HttpResponse.json({ success: true, data: [], message: 'No workspaces' });
      })
    );

    const { result } = renderHook(() => useWorkspaces(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
  
  test('should handle loading state correctly', () => {
    const { result } = renderHook(() => useWorkspaces(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    // isFetching might also be true, depending on QueryClient's behavior with enabled queries
  });

  test('should return an error state when the fetch fails', async () => {
    // Override the default handler for this specific test
    server.use(
      http.get('/api/workspaces', () => {
        return HttpResponse.json({ success: false, message: 'Mocked server error for workspaces' }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useWorkspaces(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Mocked server error for workspaces');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined(); // Or potentially the last successfully fetched data, depending on config
  });
});
