// Workspace selector component
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useWorkspaces, useCreateWorkspace } from '../lib/queries/workspaces';
import { Workspace } from '../lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { toast } from 'sonner';

interface WorkspaceSelectorProps {
  selectedWorkspaceId?: string;
  onWorkspaceChange: (workspaceId: string) => void;
}

export function WorkspaceSelector({ selectedWorkspaceId, onWorkspaceChange }: WorkspaceSelectorProps) {
  const { data: workspaces, isLoading } = useWorkspaces();
  const createWorkspace = useCreateWorkspace();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '' });

  const handleCreateWorkspace = async () => {
    if (!newWorkspace.name.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    try {
      const workspace = await createWorkspace.mutateAsync({
        name: newWorkspace.name.trim(),
        description: newWorkspace.description.trim() || undefined,
      });

      setNewWorkspace({ name: '', description: '' });
      setIsCreateDialogOpen(false);
      onWorkspaceChange(workspace.id);
      toast.success('Workspace created successfully');
    } catch {
      toast.error('Failed to create workspace');
    }
  };

  if (isLoading) {
    return <div className="w-48 h-10 bg-muted animate-pulse rounded-md" />;
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedWorkspaceId} onValueChange={onWorkspaceChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select workspace" />
        </SelectTrigger>
        <SelectContent>
          {workspaces?.map((workspace: Workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              {workspace.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new workspace to organize your API collections and requests.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="workspace-name">Name</Label>
              <Input
                id="workspace-name"
                value={newWorkspace.name}
                onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workspace name"
              />
            </div>
            <div>
              <Label htmlFor="workspace-description">Description (optional)</Label>
              <Textarea
                id="workspace-description"
                value={newWorkspace.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter workspace description"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateWorkspace}
              disabled={createWorkspace.isPending}
            >
              {createWorkspace.isPending ? 'Creating...' : 'Create'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
