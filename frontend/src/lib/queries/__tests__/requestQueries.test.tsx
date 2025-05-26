import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useRequestsByCollection } from '../requestQueries'; // Adjust path as necessary
import { server } from '../../../mocks/server'; // Adjust path as necessary
import { http, HttpResponse } from 'msw';

// Helper to create a QueryClient wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useRequestsByCollection', () => {
  const validCollectionId = 'col123';
  const errorCollectionId = 'col_error'; // Handler should be set up for this

  test('should return a list of requests when a valid collectionId is provided', async () => {
    const { result } = renderHook(() => useRequestsByCollection(validCollectionId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].name).toBe('Request 1');
    expect(result.current.data?.[0].collectionId).toBe(validCollectionId);
    expect(result.current.isLoading).toBe(false);
  });

  test('should return an empty list and not fetch if collectionId is null', async () => {
    const { result } = renderHook(() => useRequestsByCollection(null), {
      wrapper: createWrapper(),
    });

    // Query is disabled, so it should immediately be in a non-loading, non-error state with no data
    // isSuccess might be false if it never fetched, check isPending or isLoading
    expect(result.current.isLoading).toBe(false); // or isPending depending on version/usage
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toEqual([]); // Hook initializes to [] if collectionId is falsy
    expect(result.current.isSuccess).toBe(true); // because it successfully determined not to fetch and returned []
  });

  test('should return an empty list and not fetch if collectionId is undefined', async () => {
    const { result } = renderHook(() => useRequestsByCollection(undefined), {
      wrapper: createWrapper(),
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toEqual([]);
    expect(result.current.isSuccess).toBe(true);
  });
  
  test('should handle loading state correctly when collectionId is provided', () => {
    const { result } = renderHook(() => useRequestsByCollection(validCollectionId), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  test('should return an error state when the fetch fails for a given collectionId', async () => {
    // MSW handler for 'col_error' is already set up in handlers.ts to return an error
    const { result } = renderHook(() => useRequestsByCollection(errorCollectionId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch requests for collection (mocked error)');
    expect(result.current.isLoading).toBe(false);
  });

  test('should return empty data when API returns success:true but data:[]', async () => {
    server.use(
      http.get('/api/requests/collection/:collectionId', ({ params }) => {
        return HttpResponse.json({ success: true, data: [], message: 'No requests found' });
      })
    );
    const { result } = renderHook(() => useRequestsByCollection('some_collection_id_empty'), {
        wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
