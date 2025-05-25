import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { WorkspaceSelector } from '../../components/WorkspaceSelector';
import { CollectionsList } from '../../components/CollectionsList';
import { RequestsList } from '../../components/RequestsList';
import { RequestEditor } from '../../components/RequestEditor';
import { EnvironmentSelector } from '../../components/EnvironmentSelector';

export const Route = createFileRoute('/features/')({
  component: FeaturesPage,
});

function FeaturesPage() {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');

  return (
    <div className="container mx-auto p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Zecretly API Client</h1>
          <WorkspaceSelector
            selectedWorkspaceId={selectedWorkspaceId}
            onWorkspaceChange={setSelectedWorkspaceId}
          />
        </div>
        <EnvironmentSelector workspaceId={selectedWorkspaceId} />
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Sidebar */}
        <div className="col-span-3 space-y-6 overflow-y-auto">
          {selectedWorkspaceId && (
            <>
              <CollectionsList
                workspaceId={selectedWorkspaceId}
                selectedCollectionId={selectedCollectionId}
                onCollectionSelect={setSelectedCollectionId}
              />
              {selectedCollectionId && (
                <RequestsList
                  collectionId={selectedCollectionId}
                  selectedRequestId={selectedRequestId}
                  onRequestSelect={setSelectedRequestId}
                />
              )}
            </>
          )}
        </div>

        {/* Main Content Area */}
        <div className="col-span-9 overflow-y-auto">
          {selectedRequestId ? (
            <RequestEditor requestId={selectedRequestId} />
          ) : selectedWorkspaceId ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Select a Request</h3>
                <p>Choose a request from the sidebar to start testing your API</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Welcome to Zecretly</h3>
                <p>Select a workspace to get started with your API testing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
