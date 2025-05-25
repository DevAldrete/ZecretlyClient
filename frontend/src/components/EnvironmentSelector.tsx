import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useEnvironmentsByWorkspace, useCreateEnvironment, useActivateEnvironment } from '../lib/queries/environments';
import { Environment } from '../lib/types';
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
  workspaceId: string;
}

export function EnvironmentSelector({ workspaceId }: EnvironmentSelectorProps) {
  const { data: environments, isLoading } = useEnvironmentsByWorkspace(workspaceId);
  const createEnvironment = useCreateEnvironment();
  const activateEnvironment = useActivateEnvironment();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEnvironment, setNewEnvironment] = useState({ name: '' });

  const activeEnvironment = environments?.find((env: Environment) => env.isActive);

  const handleCreateEnvironment = async () => {
    if (!newEnvironment.name.trim()) {
      toast.error('Environment name is required');
      return;
    }

    try {
      await createEnvironment.mutateAsync({
        name: newEnvironment.name.trim(),
        workspaceId,
        variables: {},
      });

      setNewEnvironment({ name: '' });
      setIsCreateDialogOpen(false);
      toast.success('Environment created successfully');
    } catch {
      toast.error('Failed to create environment');
    }
  };

  const handleEnvironmentChange = async (environmentId: string) => {
    try {
      await activateEnvironment.mutateAsync(environmentId);
      toast.success('Environment activated');
    } catch {
      toast.error('Failed to activate environment');
    }
  };

  if (!workspaceId || isLoading) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={activeEnvironment?.id || ''} onValueChange={handleEnvironmentChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="No environment" />
        </SelectTrigger>
        <SelectContent>
          {environments?.map((environment: Environment) => (
            <SelectItem key={environment.id} value={environment.id}>
              {environment.name}
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
            <AlertDialogTitle>Create New Environment</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new environment to manage variables for different stages (dev, staging, prod).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="environment-name">Name</Label>
              <Input
                id="environment-name"
                value={newEnvironment.name}
                onChange={(e) => setNewEnvironment(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter environment name"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateEnvironment}
              disabled={createEnvironment.isPending}
            >
              {createEnvironment.isPending ? 'Creating...' : 'Create'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
