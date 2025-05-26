import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useRequestsByCollection, useCreateRequest, CreateRequestPayload, HttpMethod, RequestModel } from '../lib/queries/requestQueries';
import { toast } from 'sonner'; // Import toast
interface RequestListProps {
  selectedCollectionId: string | null | undefined;
  selectedRequestId: string | null | undefined;
  onSelectRequest: (id: string) => void;
}

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

const RequestList: React.FC<RequestListProps> = ({ selectedCollectionId, selectedRequestId, onSelectRequest }) => {
  const { 
    data: requests, 
    isLoading: isLoadingRequests, 
    isError: isErrorRequests, 
    error: errorRequests 
  } = useRequestsByCollection(selectedCollectionId);

  const createRequestMutation = useCreateRequest();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRequestName, setNewRequestName] = useState('');
  const [newRequestMethod, setNewRequestMethod] = useState<HttpMethod>("GET");

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollectionId) {
      alert("A collection must be selected to create a request.");
      return;
    }
    if (!newRequestName.trim()) {
      alert("Request name cannot be empty.");
      return;
    }
    const payload: CreateRequestPayload = {
      name: newRequestName,
      method: newRequestMethod,
      collectionId: selectedCollectionId,
      url: 'https://api.example.com/new_request', // Default URL
      // status is handled by the mutation hook or backend
    };
    try {
      await createRequestMutation.mutateAsync(payload);
      toast.success(`Request "${newRequestName}" created!`); // Success toast
      setNewRequestName('');
      setNewRequestMethod("GET");
      setShowCreateForm(false);
    } catch (err: any) { // Explicitly type err
      console.error("Failed to create request:", err);
    }
  };

  if (!selectedCollectionId) {
    return <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">Select a collection to see requests.</p>;
  }

  if (isLoadingRequests) {
    return <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Loading requests...</p>;
  }

  if (isErrorRequests) {
    return <p className="mt-2 text-xs text-red-500 dark:text-red-400">Error: {errorRequests?.message || 'Unknown error'}</p>;
  }

  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (requests && requests.length > 0 && listRef.current) {
      gsap.fromTo(listRef.current.children,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out"
        }
      );
    }
  }, [requests]);

  return (
    <div className="pt-2 flex-grow flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-100">API Requests</h5>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)} 
          className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm dark:bg-blue-600 dark:hover:bg-blue-700"
          title={showCreateForm ? 'Cancel request creation' : 'Create new API request'}
        >
          {showCreateForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {showCreateForm && (
        <form 
          onSubmit={handleCreateRequest} 
          className="mb-3 p-3 border border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800"
        >
          <h6 className="text-xs font-semibold mb-2 text-slate-700 dark:text-slate-200">New API Request</h6>
          <div className="mb-2">
            <label htmlFor="requestName" className="block text-xs font-medium text-slate-700 dark:text-slate-300">Name:</label>
            <input
              id="requestName"
              type="text"
              value={newRequestName}
              onChange={(e) => setNewRequestName(e.target.value)}
              required
              className="mt-1 block w-full px-2 py-1 text-xs border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="requestMethod" className="block text-xs font-medium text-slate-700 dark:text-slate-300">Method:</label>
            <select
              id="requestMethod"
              value={newRequestMethod}
              onChange={(e) => setNewRequestMethod(e.target.value as HttpMethod)}
              className="mt-1 block w-full px-2 py-1 text-xs border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
            >
              {HTTP_METHODS.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
          <button 
            type="submit" 
            disabled={createRequestMutation.isPending}
            className="px-3 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md shadow-sm disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-700"
          >
            {createRequestMutation.isPending ? 'Creating...' : 'Create Request'}
          </button>
          {createRequestMutation.isError && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              Error: {createRequestMutation.error?.message || 'Failed to create request'}
            </p>
          )}
        </form>
      )}

      {requests && requests.length > 0 ? (
        <ul ref={listRef} className="list-none p-0 m-0 overflow-y-auto flex-grow space-y-0.5"> {/* Added space-y-0.5 */}
          {requests.map((request: RequestModel) => (
            <li 
              key={request.id}
              onClick={() => onSelectRequest(request.id)}
              className={`p-1.5 text-xs cursor-pointer rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 flex justify-between items-center transition-colors duration-150 ${
                request.id === selectedRequestId ? 'bg-slate-300 dark:bg-slate-600 font-semibold text-slate-800 dark:text-slate-50' : 'text-slate-700 dark:text-slate-300'
              }`}
              title={`${request.method} - ${request.name}`}
            >
              <span className="truncate flex-1">{request.name}</span> {/* Removed underscore, flex-1 for truncation */}
              <span 
                className={`ml-2 px-1.5 py-0.5 text-xs rounded-sm ${
                  request.id === selectedRequestId ? 'bg-blue-600 text-white dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {request.method}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400 italic text-center mt-2">
          No requests in this collection.
        </p>
      )}
    </div>
  );
};

export default RequestList;
