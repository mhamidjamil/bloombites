'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Loader2, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import ImagePicker from '@/components/image-picker';
import { useToast } from '@/hooks/use-toast';
import {
  getBouquetStyles,
  addBouquetStyle,
  updateBouquetStyle,
  deleteBouquetStyle,
} from '@/lib/db-service';
import type { BouquetStyle } from '@/lib/types';

export default function AdminStylesPage() {
  const [styles, setStyles] = useState<BouquetStyle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<BouquetStyle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    isEnabled: true,
  });

  const loadStyles = useCallback(async () => {
    try {
      const fetchedStyles = await getBouquetStyles();
      setStyles(fetchedStyles);
    } catch (error) {
      console.error('Failed to load styles:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load styles.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStyles();
  }, [loadStyles]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      image: '',
      isEnabled: true,
    });
    setEditingStyle(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (style: BouquetStyle) => {
    setFormData({
      name: style.name,
      description: style.description,
      price: style.price,
      image: style.image || '',
      isEnabled: style.isEnabled ?? true,
    });
    setEditingStyle(style);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingStyle) {
        await updateBouquetStyle(editingStyle.id, formData);
        toast({
          title: 'Success',
          description: 'Style updated successfully.',
        });
      } else {
        await addBouquetStyle(formData);
        toast({
          title: 'Success',
          description: 'Style added successfully.',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadStyles();
    } catch (error) {
      console.error('Failed to save style:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save style.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this style?')) return;

    try {
      await deleteBouquetStyle(id);
      toast({
        title: 'Success',
        description: 'Style deleted successfully.',
      });
      loadStyles();
    } catch (error) {
      console.error('Failed to delete style:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete style.',
      });
    }
  };

  const handleImageUpload = async (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }));
    toast({
      title: 'Success',
      description: 'Image uploaded successfully.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bouquet Styles</h1>
            <p className="text-muted-foreground">
              Manage presentation styles for custom bouquets
            </p>
          </div>
          <Button onClick={openAddDialog}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Style
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {styles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No styles found. Add your first style to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  styles.map((style) => (
                    <TableRow key={style.id}>
                      <TableCell>
                        {style.image ? (
                          <img
                            src={style.image}
                            alt={style.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                              No image
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {style.name}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {style.description}
                      </TableCell>
                      <TableCell>R{style.price}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            (style.isEnabled ?? true)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {(style.isEnabled ?? true) ? 'Enabled' : 'Disabled'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(style)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit style</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(style.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete style</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingStyle ? 'Edit Style' : 'Add New Style'}
                </DialogTitle>
                <DialogDescription>
                  {editingStyle
                    ? 'Update the style details below.'
                    : 'Create a new presentation style for bouquets.'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Classic Gift Box"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe the presentation style..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (R)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Image</Label>
                  {formData.image ? (
                    <div className="flex items-center gap-4">
                      <img
                        src={formData.image}
                        alt="Style preview"
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, image: '' }))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <ImagePicker
                      onImageSelected={(url) =>
                        setFormData((prev) => ({ ...prev, image: url }))
                      }
                    />
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isEnabled"
                    checked={formData.isEnabled}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isEnabled: checked }))
                    }
                  />
                  <Label htmlFor="isEnabled">Enabled</Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingStyle ? 'Update' : 'Add'} Style
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
