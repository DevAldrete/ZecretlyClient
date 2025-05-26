import { useState } from 'react';
import { Plus } from 'lucide-react';
// Corrected import path and added useActiveEnvironment
import { 
  useEnvironmentsByWorkspace, 
  useCreateEnvironment, 
  useActivateEnvironment,
  useActiveEnvironment, // Added this hook
  Environment  // Assuming Environment type is also exported from environmentQueries
} from '../lib/queries/environmentQueries'; 
// Removed 'Environment' from '../lib/types' as it should come from query file
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

interface EnvironmentSelectorProps {
  selectedWorkspaceId: string | null | undefined; // Changed prop name and type
}

export function EnvironmentSelector({ selectedWorkspaceId }: EnvironmentSelectorProps) { // Changed prop name
  const { 
    data: environments, 
    isLoading: isLoadingEnvs,
    isError: isErrorEnvs,
    error: errorEnvs,
  } = useEnvironmentsByWorkspace(selectedWorkspaceId);
  
  const { 
    data: activeEnvironmentData, // Renamed to avoid conflict with derived activeEnvironment
    isLoading: isLoadingActive,
    isError: isErrorActive,
    error: errorActive,
  } = useActiveEnvironment(selectedWorkspaceId);

  const createEnvironment = useCreateEnvironment();
  const activateEnvironment = useActivateEnvironment();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEnvironmentName, setNewEnvironmentName] = useState(''); // Changed to string for name only

  // The active environment ID from the specific hook, or derived from the list if that hook is loading/failed
  const currentActiveId = activeEnvironmentData?.id || environments?.find(env => env.isActive)?.id;

  const handleCreateEnvironment = async () => {
    if (!newEnvironmentName.trim()) {
      toast.error('Environment name is required');
      return;
    }
    if (!selectedWorkspaceId) {
      toast.error('Workspace ID is missing.'); // Should not happen if UI is structured well
      return;
    }

    try {
      await createEnvironment.mutateAsync({
        name: newEnvironmentName.trim(),
        workspaceId: selectedWorkspaceId, // Use selectedWorkspaceId
        variables: {}, // Default empty variables
      });

      setNewEnvironmentName(''); // Reset name
      setIsCreateDialogOpen(false);
      toast.success('Environment created successfully');
    } catch (e: any) {
      toast.error(e.message || 'Failed to create environment');
    }
  };

  const handleEnvironmentChange = async (environmentId: string) => {
    if (!selectedWorkspaceId) { // Guard against missing workspaceId
      toast.error("Cannot activate environment without a selected workspace.");
      return;
    }
    if (!environmentId) { // Handling "No Environment" selection
      // Here, you might want to implement a "deactivate" functionality if your backend supports it
      // For now, we'll assume selecting "No Environment" means no action or a specific "deactivate" call
      console.log("No environment selected (deactivation not implemented yet).");
      // Potentially call a useDeactivateEnvironment mutation here
      // And then update the active environment query data to null
      // queryClient.setQueryData(['environments', selectedWorkspaceId, 'active'], null);
      // queryClient.invalidateQueries({ queryKey: ['environments', selectedWorkspaceId] });
      toast.info("Deactivation functionality is not yet implemented.");
      return;
    }
    try {
      await activateEnvironment.mutateAsync({ environmentId, workspaceId: selectedWorkspaceId });
      toast.success('Environment activated');
    } catch (e: any) {
      toast.error(e.message || 'Failed to activate environment');
    }
  };
  
  // Handle loading and error states for both hooks
  if (isLoadingEnvs || isLoadingActive) {
    return <div className="text-sm text-muted-foreground">Loading environments...</div>;
  }

  // Combined error display or more specific messages
  if (isErrorEnvs || isErrorActive) {
    return <div className="text-sm text-red-500">
      Error loading environments. {errorEnvs?.message || errorActive?.message}
    </div>;
  }
  
  // If no workspace is selected, show a disabled state or minimal UI
  if (!selectedWorkspaceId) {
    return (
      <div className="flex items-center gap-2">
        <Select disabled>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="No workspace selected" />
          </SelectTrigger>
        </Select>
        <Button variant="outline" size="icon" disabled>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select 
        value={currentActiveId || ''} 
        onValueChange={handleEnvironmentChange}
        disabled={activateEnvironment.isPending} // Disable while an activation is in progress
      >
        <SelectTrigger className="w-48" disabled={activateEnvironment.isPending}>
          <SelectValue placeholder="No environment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">No Environment</SelectItem> {/* Explicit option for no environment */}
          {environments?.map((environment: Environment) => (
            <SelectItem key={environment.id} value={environment.id}>
              {environment.name} {environment.id === currentActiveId ? " (Active)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {activateEnvironment.isPending && <span className="text-xs">Activating...</span>}
      <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="icon" disabled={createEnvironment.isPending}>
            <Plus className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Environment</AlertDialogTitle>
            <AlertDialogDescription>
              Manage variables for different stages (e.g., dev, staging, prod).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="environment-name">Name</Label>
              <Input
                id="environment-name"
                value={newEnvironmentName} // Use newEnvironmentName
                onChange={(e) => setNewEnvironmentName(e.target.value)} // Update newEnvironmentName
                placeholder="e.g., Development"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateEnvironment}
              disabled={createEnvironment.isPending || !newEnvironmentName.trim()}
            >
              {createEnvironment.isPending ? 'Creating...' : 'Create'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
