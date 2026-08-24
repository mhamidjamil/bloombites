'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Loader2, Tag } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  countCategoryUsage,
  slugify,
} from '@/lib/db-service';
import type { Category } from '@/lib/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    type: 'product',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      const message = 'Failed to load categories.';
      console.error(
        JSON.stringify({
          operation: 'admin.categories.loadData',
          message: error instanceof Error ? error.message : String(error),
        })
      );
      setLoadError(message);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openNewDialog = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      type: 'product',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({ ...category });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Name is required.',
      });
      return;
    }
    const slug = slugify(formData.name);
    const isDuplicate = categories.some(
      (c) => c.slug === slug && c.id !== editingCategory?.id
    );
    if (isDuplicate) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: `A category with the slug "${slug}" already exists. Choose a different name.`,
      });
      return;
    }
    setIsSaving(true);
    try {
      const dataToSave: any = {
        name: formData.name,
        type: formData.type || 'product',
        slug,
      };

      if (editingCategory && editingCategory.id) {
        await updateCategory(editingCategory.id, dataToSave);
        toast({ title: 'Success', description: 'Category updated.' });
      } else {
        await addCategory(dataToSave);
        toast({ title: 'Success', description: 'Category created.' });
      }

      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error(
        JSON.stringify({
          operation: 'admin.categories.save',
          categoryId: editingCategory?.id || null,
          message: error instanceof Error ? error.message : String(error),
        })
      );
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save category.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const usageCount = await countCategoryUsage(category.slug);
      if (usageCount > 0) {
        toast({
          variant: 'destructive',
          title: 'Cannot delete',
          description: `${usageCount} product/item record${usageCount === 1 ? '' : 's'} use this category.`,
        });
        return;
      }
      await deleteCategory(category.id);
      setCategories(categories.filter((c) => c.id !== category.id));
      toast({ title: 'Deleted', description: 'Category removed.' });
    } catch (error) {
      console.error(
        JSON.stringify({
          operation: 'admin.categories.delete',
          categoryId: category.id,
          message: error instanceof Error ? error.message : String(error),
        })
      );
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete category.',
      });
    }
  };

  if (isLoading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (loadError)
    return (
      <div className="p-10 flex flex-col items-center gap-4 text-center">
        <p className="text-destructive">{loadError}</p>
        <Button variant="outline" onClick={loadData}>
          Retry
        </Button>
      </div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline">Manage Categories</h1>
        <Button onClick={openNewDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No categories found.
                  </TableCell>
                </TableRow>
              )}
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {cat.slug}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${cat.type === 'product' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
                    >
                      {cat.type === 'product' ? 'Product' : 'Item'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(cat)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(cat)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Update this category.'
                : 'Add a new category for bouquets or custom items.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Chocolates"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(val: any) =>
                  setFormData({ ...formData, type: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product (Bouquet)</SelectItem>
                  <SelectItem value="item">Item (Custom Component)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
