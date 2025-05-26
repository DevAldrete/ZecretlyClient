import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useWorkspaces, Workspace, useCreateWorkspace, CreateWorkspacePayload } from '../lib/queries/workspaceQueries';
import { toast } from 'sonner'; // Import toast
interface WorkspaceListProps {
  selectedWorkspaceId: string | null;
  onSelectWorkspace: (id: string) => void;
}

const WorkspaceList: React.FC<WorkspaceListProps> = ({ selectedWorkspaceId, onSelectWorkspace }) => {
  const { data: workspaces, isLoading: isLoadingWorkspaces, isError: isErrorWorkspaces, error: errorWorkspaces } = useWorkspaces();
  const createWorkspaceMutation = useCreateWorkspace();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) {
      alert("Workspace name cannot be empty.");
      return;
    }
    const payload: CreateWorkspacePayload = {
      name: newWorkspaceName,
      description: newWorkspaceDescription || undefined,
    };
    try {
      await createWorkspaceMutation.mutateAsync(payload);
      toast.success(`Workspace "${newWorkspaceName}" created!`); // Success toast
      setNewWorkspaceName('');
      setNewWorkspaceDescription('');
      setShowCreateForm(false);
    } catch (err: any) { // Explicitly type err
      // Error is handled by the component's error display + console log
      // No need for another toast here if the component shows the error message
      console.error("Failed to create workspace:", err);
    }
  };

  if (isLoadingWorkspaces) {
    return <p className="p-2 text-sm text-slate-500 dark:text-slate-400">Loading workspaces...</p>; // Styled loading
  }

  if (isErrorWorkspaces) {
    return <p className="text-red-500">Error fetching workspaces: {errorWorkspaces?.message || 'Unknown error'}</p>;
  }

  // Removed selectedStyle object
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (workspaces && workspaces.length > 0 && listRef.current) {
      gsap.fromTo(listRef.current.children, 
        { opacity: 0, y: 10 }, 
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.3, 
          stagger: 0.05, // Stagger animation for each item
          ease: "power2.out" 
        }
      );
    }
  }, [workspaces]); // Trigger animation when workspaces data changes

  return (
    <div className="p-2">
      <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-100">Workspaces</h3>
      <button 
        onClick={() => setShowCreateForm(!showCreateForm)} 
        className="mb-3 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        {showCreateForm ? 'Cancel' : 'Create New Workspace'}
      </button>

      {showCreateForm && (
        <form 
          onSubmit={handleCreateWorkspace} 
          className="mb-4 p-3 border border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800"
        >
          <h4 className="text-md font-semibold mb-2 text-slate-700 dark:text-slate-200">New Workspace</h4>
          <div className="mb-2">
            <label htmlFor="workspaceName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name:</label>
            <input
              id="workspaceName"
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              required
              className="mt-1 block w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="workspaceDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description (Optional):</label>
            <textarea
              id="workspaceDescription"
              value={newWorkspaceDescription}
              onChange={(e) => setNewWorkspaceDescription(e.target.value)}
              className="mt-1 block w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-700 dark:text-white"
              rows={2}
            />
          </div>
          <button 
            type="submit" 
            disabled={createWorkspaceMutation.isPending}
            className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md shadow-sm disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-700"
          >
            {createWorkspaceMutation.isPending ? 'Creating...' : 'Create'}
          </button>
          {createWorkspaceMutation.isError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              Error: {createWorkspaceMutation.error?.message || 'Failed to create workspace'}
            </p>
          )}
        </form>
      )}

      {workspaces && workspaces.length > 0 ? (
        <ul ref={listRef} className="list-none p-0 space-y-1"> {/* Added space-y-1 for item spacing */}
          {workspaces.map((workspace: Workspace) => (
            <li
              key={workspace.id}
              onClick={() => onSelectWorkspace(workspace.id)}
              className={`p-2 cursor-pointer rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-150 ${
                workspace.id === selectedWorkspaceId ? 'bg-slate-300 dark:bg-slate-600 font-semibold text-slate-800 dark:text-slate-50' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {workspace.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">No workspaces found.</p>
      )}
    </div>
  );
};

export default WorkspaceList;
