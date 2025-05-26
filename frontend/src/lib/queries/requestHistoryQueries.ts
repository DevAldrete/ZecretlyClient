import { useQuery } from '@tanstack/react-query';
import api from '../api-client';

export interface RequestHistoryEntry {
  id: string;
  sourceRequestId?: string;
  method: string;
  url: string;
  requestHeaders?: Record<string, string>;
  requestBodyType?: string;
  requestBodyContent?: string;
  responseStatusCode?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
  durationMs?: number;
  executedAt: string; // ISO timestamp string
}

interface ApiRequestHistoryListResponse {
  success: boolean;
  data: RequestHistoryEntry[];
  message: string;
}

export const useRequestHistories = (requestId: string | null | undefined) => {
  return useQuery<RequestHistoryEntry[], Error>({
    queryKey: ['requestHistories', requestId],
    queryFn: async () => {
      if (!requestId) {
        return []; 
      }
      const response = await api.get<ApiRequestHistoryListResponse>(`/request-histories/request/${requestId}`);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch request histories');
      }
      return response.data;
    },
    enabled: !!requestId, // Query will only run if requestId is truthy
  });
};
