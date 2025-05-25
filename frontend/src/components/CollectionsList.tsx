import { useState } from 'react';
import { Plus, Folder, Trash2 } from 'lucide-react';
import { useCollectionsByWorkspace, useCreateCollection, useDeleteCollection } from '../lib/queries/collections';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
import { Collection } from '../lib/types';

interface CollectionsListProps {
  workspaceId: string;
  selectedCollectionId?: string;
  onCollectionSelect: (collectionId: string) => void;
}

export function CollectionsList({ workspaceId, selectedCollectionId, onCollectionSelect }: CollectionsListProps) {
  const { data: collections, isLoading } = useCollectionsByWorkspace(workspaceId);
  const createCollection = useCreateCollection();
  const deleteCollection = useDeleteCollection();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);

  const handleCreateCollection = async () => {
    if (!newCollection.name.trim()) {
      toast.error('Collection name is required');
      return;
    }

    try {
      const collection = await createCollection.mutateAsync({
        name: newCollection.name.trim(),
        description: newCollection.description.trim() || undefined,
        workspaceId,
      });

      setNewCollection({ name: '', description: '' });
      setIsCreateDialogOpen(false);
      onCollectionSelect(collection.id);
      toast.success('Collection created successfully');
    } catch {
      toast.error('Failed to create collection');
    }
  };

  const handleDeleteCollection = async (collection: Collection) => {
    try {
      await deleteCollection.mutateAsync(collection.id);
      setCollectionToDelete(null);
      if (selectedCollectionId === collection.id) {
        onCollectionSelect('');
      }
      toast.success('Collection deleted successfully');
    } catch {
      toast.error('Failed to delete collection');
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
        <h3 className="text-lg font-semibold">Collections</h3>
        <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create New Collection</AlertDialogTitle>
              <AlertDialogDescription>
                Create a new collection to group related API requests.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="collection-name">Name</Label>
                <Input
                  id="collection-name"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter collection name"
                />
              </div>
              <div>
                <Label htmlFor="collection-description">Description (optional)</Label>
                <Textarea
                  id="collection-description"
                  value={newCollection.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter collection description"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCreateCollection}
                disabled={createCollection.isPending}
              >
                {createCollection.isPending ? 'Creating...' : 'Create'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="space-y-2">
        {collections?.map((collection: Collection) => (
          <Card
            key={collection.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedCollectionId === collection.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onCollectionSelect(collection.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm">{collection.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCollectionToDelete(collection);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            {collection.description && (
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">{collection.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <AlertDialog
        open={!!collectionToDelete}
        onOpenChange={() => setCollectionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{collectionToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => collectionToDelete && handleDeleteCollection(collectionToDelete)}
              disabled={deleteCollection.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCollection.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
