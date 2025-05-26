import React, { useState } from 'react';
import WorkspaceList from './WorkspaceList';
import CollectionList from './CollectionList';
import RequestList from './RequestList';
import { RequestEditor } from './RequestEditor';
import { EnvironmentSelector } from './EnvironmentSelector';

const AppLayout: React.FC = () => {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const handleSelectWorkspace = (id: string) => {
    setSelectedWorkspaceId(id);
    setSelectedCollectionId(null); 
    setSelectedRequestId(null); 
    // console.log("Selected workspace ID:", id); // Keep console logs for debugging if needed
  };

  const handleSelectCollection = (id: string) => {
    setSelectedCollectionId(id);
    setSelectedRequestId(null); 
    // console.log("Selected collection ID:", id);
  };

  const handleSelectRequest = (id: string) => {
    setSelectedRequestId(id);
    // console.log("Selected request ID:", id);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-100 dark:bg-slate-800 p-4 overflow-y-auto flex flex-col space-y-3 border-r border-slate-200 dark:border-slate-700">
        <WorkspaceList 
          selectedWorkspaceId={selectedWorkspaceId}
          onSelectWorkspace={handleSelectWorkspace}
        />
        <hr className="border-slate-300 dark:border-slate-600" />
        <CollectionList 
          selectedWorkspaceId={selectedWorkspaceId}
          selectedCollectionId={selectedCollectionId}
          onSelectCollection={handleSelectCollection}
        />
        <hr className="border-slate-300 dark:border-slate-600" />
        <RequestList 
          selectedCollectionId={selectedCollectionId}
          selectedRequestId={selectedRequestId}
          onSelectRequest={handleSelectRequest}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-hidden">
        {/* Environment Selector Bar */}
        <header className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shadow-sm">
          <EnvironmentSelector selectedWorkspaceId={selectedWorkspaceId} />
        </header>

        {/* Request Editor Area */}
        <div className="flex-1 overflow-y-auto"> {/* This div will scroll RequestEditor */}
          <RequestEditor selectedRequestId={selectedRequestId} />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
