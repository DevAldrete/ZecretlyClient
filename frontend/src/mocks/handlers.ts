import { http, HttpResponse } from 'msw';
import { Workspace } from '../lib/queries/workspaceQueries'; // Adjust path as needed

export const handlers = [
  // Mock for GET /api/workspaces
  http.get('/api/workspaces', ({ request }) => {
    // Check for a specific test scenario if needed, e.g., via a header or query param
    const url = new URL(request.url);
    if (url.searchParams.get('scenario') === 'error') {
      return HttpResponse.json({ success: false, message: 'Failed to fetch workspaces (mocked error)' }, { status: 500 });
    }

    if (url.searchParams.get('scenario') === 'empty') {
      return HttpResponse.json({
        success: true,
        data: [],
        message: 'Successfully fetched empty workspaces list',
      });
    }

    // Default success response
    const mockWorkspaces: Workspace[] = [
      { id: 'ws1', name: 'Workspace 1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), description: 'Desc 1' },
      { id: 'ws2', name: 'Workspace 2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
    return HttpResponse.json({
      success: true,
      data: mockWorkspaces,
      message: 'Successfully fetched workspaces',
    });
  }),

  // Mock for GET /api/requests/collection/:collectionId
  http.get('/api/requests/collection/:collectionId', ({ params, request }) => {
    const { collectionId } = params;
    const url = new URL(request.url);

    if (collectionId === 'col_error') {
      return HttpResponse.json({ success: false, message: 'Failed to fetch requests for collection (mocked error)' }, { status: 500 });
    }
    if (collectionId === 'col_empty') {
       return HttpResponse.json({ success: true, data: [], message: 'No requests in this collection' });
    }

    // Default success response
    const mockRequests = [
      { id: 'req1', collectionId, name: 'Request 1', method: 'GET', url: 'http://example.com/req1', status:200, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'req2', collectionId, name: 'Request 2', method: 'POST', url: 'http://example.com/req2', status:200, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
    return HttpResponse.json({ success: true, data: mockRequests, message: 'Successfully fetched requests' });
  }),
  
  // Add other handlers here as needed
];
