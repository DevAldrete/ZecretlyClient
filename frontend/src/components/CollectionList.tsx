import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useCollectionsByWorkspace, useCreateCollection, CreateCollectionPayload, Collection } from '../lib/queries/collectionQueries';
import { toast } from 'sonner'; // Import toast
interface CollectionListProps {
  selectedWorkspaceId: string | null | undefined;
  selectedCollectionId: string | null | undefined;
  onSelectCollection: (id: string) => void;
}

const CollectionList: React.FC<CollectionListProps> = ({ selectedWorkspaceId, selectedCollectionId, onSelectCollection }) => {
  const { 
    data: collections, 
    isLoading: isLoadingCollections, 
    isError: isErrorCollections, 
    error: errorCollections 
  } = useCollectionsByWorkspace(selectedWorkspaceId);

  const createCollectionMutation = useCreateCollection();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspaceId) {
      alert("A workspace must be selected to create a collection.");
      return;
    }
    if (!newCollectionName.trim()) {
      alert("Collection name cannot be empty.");
      return;
    }
    const payload: CreateCollectionPayload = {
      name: newCollectionName,
      description: newCollectionDescription || undefined,
      workspaceId: selectedWorkspaceId,
    };
    try {
      await createCollectionMutation.mutateAsync(payload);
      toast.success(`Collection "${newCollectionName}" created!`); // Success toast
      setNewCollectionName('');
      setNewCollectionDescription('');
      setShowCreateForm(false);
    } catch (err: any) { // Explicitly type err
      console.error("Failed to create collection:", err);
    }
  };

  if (!selectedWorkspaceId) {
    return <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 italic">Select a workspace to see collections.</p>;
  }

  if (isLoadingCollections) {
    return <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading collections...</p>;
  }

  if (isErrorCollections) {
    return <p className="mt-3 text-sm text-red-500 dark:text-red-400">Error fetching collections: {errorCollections?.message || 'Unknown error'}</p>;
  }

  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (collections && collections.length > 0 && listRef.current) {
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
  }, [collections]);

  return (
    <div className="pt-2">
      <h4 className="text-md font-semibold mb-2 text-slate-800 dark:text-slate-100">Collections</h4>
      <button 
        onClick={() => setShowCreateForm(!showCreateForm)} 
        className="mb-3 px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        {showCreateForm ? 'Cancel Creation' : 'Create New Collection'}
      </button>

      {showCreateForm && (
        <form 
          onSubmit={handleCreateCollection} 
          className="mb-3 p-3 border border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800"
        >
          <h5 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">New Collection</h5>
          <div className="mb-2">
            <label htmlFor="collectionName" className="block text-xs font-medium text-slate-700 dark:text-slate-300">Name:</label>
            <input
              id="collectionName"
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              required
              className="mt-1 block w-full px-2 py-1 text-sm border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="collectionDescription" className="block text-xs font-medium text-slate-700 dark:text-slate-300">Description (Optional):</label>
            <textarea
              id="collectionDescription"
              value={newCollectionDescription}
              onChange={(e) => setNewCollectionDescription(e.target.value)}
              className="mt-1 block w-full px-2 py-1 text-sm border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
              rows={2}
            />
          </div>
          <button 
            type="submit" 
            disabled={createCollectionMutation.isPending}
            className="px-3 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md shadow-sm disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-700"
          >
            {createCollectionMutation.isPending ? 'Creating...' : 'Create'}
          </button>
          {createCollectionMutation.isError && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              Error: {createCollectionMutation.error?.message || 'Failed to create collection'}
            </p>
          )}
        </form>
      )}

      {collections && collections.length > 0 ? (
        <ul ref={listRef} className="list-none p-0 space-y-0.5"> {/* Adjusted spacing */}
          {collections.map((collection: Collection) => (
            <li 
              key={collection.id} 
              onClick={() => onSelectCollection(collection.id)}
              className={`p-2 text-sm cursor-pointer rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-150 ${
                collection.id === selectedCollectionId ? 'bg-slate-300 dark:bg-slate-600 font-semibold text-slate-800 dark:text-slate-50' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {collection.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400 italic">No collections found in this workspace.</p>
      )}
    </div>
  );
};

export default CollectionList;
