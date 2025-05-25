// Requests list component
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useRequestsByCollection, useCreateRequest, useDeleteRequest } from '../lib/queries/requests';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
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
import { Request, HttpMethod } from '../lib/types';

interface RequestsListProps {
  collectionId: string;
  selectedRequestId?: string;
  onRequestSelect: (requestId: string) => void;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const getMethodColor = (method: HttpMethod) => {
  const colors = {
    GET: 'text-green-600 bg-green-50',
    POST: 'text-blue-600 bg-blue-50',
    PUT: 'text-orange-600 bg-orange-50',
    PATCH: 'text-yellow-600 bg-yellow-50',
    DELETE: 'text-red-600 bg-red-50',
    HEAD: 'text-purple-600 bg-purple-50',
    OPTIONS: 'text-gray-600 bg-gray-50',
  };
  return colors[method] || 'text-gray-600 bg-gray-50';
};

export function RequestsList({ collectionId, selectedRequestId, onRequestSelect }: RequestsListProps) {
  const { data: requests, isLoading } = useRequestsByCollection(collectionId);
  const createRequest = useCreateRequest();
  const deleteRequest = useDeleteRequest();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    name: '',
    method: 'GET' as HttpMethod,
    url: ''
  });
  const [requestToDelete, setRequestToDelete] = useState<Request | null>(null);

  const handleCreateRequest = async () => {
    if (!newRequest.name.trim() || !newRequest.url.trim()) {
      toast.error('Request name and URL are required');
      return;
    }

    try {
      const request = await createRequest.mutateAsync({
        name: newRequest.name.trim(),
        method: newRequest.method,
        url: newRequest.url.trim(),
        collectionId,
        status: 200,
      });

      setNewRequest({ name: '', method: 'GET', url: '' });
      setIsCreateDialogOpen(false);
      onRequestSelect(request.id);
      toast.success('Request created successfully');
    } catch {
      toast.error('Failed to create request');
    }
  };

  const handleDeleteRequest = async (request: Request) => {
    try {
      await deleteRequest.mutateAsync(request.id);
      setRequestToDelete(null);
      if (selectedRequestId === request.id) {
        onRequestSelect('');
      }
      toast.success('Request deleted successfully');
    } catch {
      toast.error('Failed to delete request');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Requests</h3>
        <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create New Request</AlertDialogTitle>
              <AlertDialogDescription>
                Create a new API request to test your endpoints.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="request-name">Name</Label>
                <Input
                  id="request-name"
                  value={newRequest.name}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter request name"
                />
              </div>
              <div>
                <Label htmlFor="request-method">Method</Label>
                <Select
                  value={newRequest.method}
                  onValueChange={(value: HttpMethod) => setNewRequest(prev => ({ ...prev, method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HTTP_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="request-url">URL</Label>
                <Input
                  id="request-url"
                  value={newRequest.url}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://api.example.com/endpoint"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCreateRequest}
                disabled={createRequest.isPending}
              >
                {createRequest.isPending ? 'Creating...' : 'Create'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="space-y-2">
        {requests?.map((request: Request) => (
          <Card
            key={request.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedRequestId === request.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onRequestSelect(request.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(request.method)}`}>
                    {request.method}
                  </span>
                  <CardTitle className="text-sm">{request.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRequestToDelete(request);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground truncate">{request.url}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={!!requestToDelete}
        onOpenChange={() => setRequestToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{requestToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => requestToDelete && handleDeleteRequest(requestToDelete)}
              disabled={deleteRequest.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRequest.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
