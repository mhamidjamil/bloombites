'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  PlusCircle,
  Edit,
  Trash2,
  Loader2,
  X,
  MoreHorizontal,
} from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import ImagePicker from '@/components/image-picker';
import { useToast } from '@/hooks/use-toast';
import {
  getBouquets,
  addProduct,
  updateProduct,
  deleteProduct,
  addSiteImage,
  getCategories,
} from '@/lib/db-service';
import type { Bouquet, Category } from '@/lib/types';

export default function AdminBouquetsPage() {
  const [products, setProducts] = useState<Bouquet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Bouquet | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<Bouquet>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    images: [],
    isFeatured: false,
    isEnabled: true,
    items: [],
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [featchedProducts, fetchedCategories] = await Promise.all([
        getBouquets(),
        getCategories(),
      ]);
      setProducts(featchedProducts);
      setCategories(fetchedCategories);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load data.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const productCategories = categories.filter((c) => c.type === 'product');

  const openNewDialog = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: productCategories[0]?.slug || 'mixed',
      images: [''],
      isFeatured: false,
      isEnabled: true,
      items: [],
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Bouquet) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsDialogOpen(true);
  };

  // Helper to save image to library history silently if it's new
  // But ImagePicker handles the "Upload" part. For URL part, we might want to track it.
  // Actually, let's just use the URL. The library tracking is nice but not strictly required for "Paste URL" feature unless desired.
  // I will skip explicit library add for "Paste URL" here to keep it simple,
  // relying on ImagePicker's upload behavior for uploads.

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Name and Price are required.',
      });
      return;
    }
    setIsSaving(true);
    try {
      const slug = formData.name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
      const dataToSave: any = {
        ...formData,
        slug,
        items: formData.items || [],
      };

      if (editingProduct && editingProduct.id) {
        await updateProduct(editingProduct.id, dataToSave);
        toast({ title: 'Success', description: 'Bouquet updated.' });
      } else {
        await addProduct(dataToSave);
        toast({ title: 'Success', description: 'Bouquet created.' });
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save bouquet.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bouquet?')) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      toast({ title: 'Deleted', description: 'Bouquet removed.' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete bouquet.',
      });
    }
  };

  if (isLoading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline">Manage Bouquets</h1>
        <Button onClick={openNewDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Bouquet
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price (PKR)</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No bouquets found.
                  </TableCell>
                </TableRow>
              )}
              {products.map((bouquet) => (
                <TableRow key={bouquet.id}>
                  <TableCell>
                    <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                      {bouquet.images?.[0] ? (
                        <img
                          src={bouquet.images[0]}
                          alt={bouquet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">
                          No Img
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {bouquet.name}
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {bouquet.slug}
                    </span>
                  </TableCell>
                  <TableCell>{bouquet.price.toLocaleString()}</TableCell>
                  <TableCell className="capitalize">
                    {categories.find((c) => c.slug === bouquet.category)
                      ?.name || bouquet.category}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={bouquet.isEnabled ? 'default' : 'secondary'}
                    >
                      {bouquet.isEnabled ? 'Active' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(bouquet)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(bouquet.id)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Bouquet' : 'Create Bouquet'}
            </DialogTitle>
            <DialogDescription>
              Add details for the bouquet product.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Price (PKR)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(val: any) =>
                  setFormData({ ...formData, category: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.length === 0 && (
                    <SelectItem value="mixed">Mixed (Default)</SelectItem>
                  )}
                  {productCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex gap-4 items-start border p-4 rounded-md">
                {formData.images?.[0] ? (
                  <div className="relative w-24 h-24 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={formData.images[0]}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-6 w-6 bg-white/50"
                      onClick={() => setFormData({ ...formData, images: [] })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-muted rounded flex items-center justify-center text-xs">
                    No Image
                  </div>
                )}
                <div className="flex-1 w-full min-w-0">
                  <ImagePicker
                    onImageSelected={(url) =>
                      setFormData({ ...formData, images: [url] })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={formData.isEnabled}
                  onCheckedChange={(c) =>
                    setFormData({ ...formData, isEnabled: c })
                  }
                />
                <Label htmlFor="enabled">Enabled</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.isFeatured}
                  onCheckedChange={(c) =>
                    setFormData({ ...formData, isFeatured: c })
                  }
                />
                <Label htmlFor="featured">Featured on Home</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Bouquet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
