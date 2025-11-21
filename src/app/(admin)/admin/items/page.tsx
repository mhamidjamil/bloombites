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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ImagePicker from '@/components/image-picker';
import { useToast } from '@/hooks/use-toast';
import {
  getCustomItems,
  addCustomItem,
  updateCustomItem,
  deleteCustomItem,
  addSiteImage,
  getCategories,
} from '@/lib/db-service';
import type { CustomItem, Category, ItemVariant } from '@/lib/types';

export default function AdminItemsPage() {
  const [items, setItems] = useState<CustomItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<CustomItem>>({
    name: '',
    price: undefined,
    category: '',
    images: [],
    variants: [],
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedItems, fetchedCategories] = await Promise.all([
        getCustomItems(),
        getCategories(),
      ]);
      setItems(fetchedItems);
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

  const itemCategories = categories.filter((c) => c.type === 'item');

  const addVariant = () => {
    const currentVariants = formData.variants || [];
    setFormData({
      ...formData,
      variants: [...currentVariants, { name: '', price: 0 }],
    });
  };

  const removeVariant = (index: number) => {
    const currentVariants = formData.variants || [];
    setFormData({
      ...formData,
      variants: currentVariants.filter((_, i) => i !== index),
    });
  };

  const updateVariant = (
    index: number,
    field: 'name' | 'price',
    value: any
  ) => {
    const currentVariants = [...(formData.variants || [])];
    if (currentVariants[index]) {
      currentVariants[index] = { ...currentVariants[index], [field]: value };
      setFormData({ ...formData, variants: currentVariants });
    }
  };

  const openNewDialog = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      price: undefined,
      category: itemCategories[0]?.slug || 'chocolates',
      images: [],
      variants: [],
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: CustomItem) => {
    setEditingItem(item);
    // Handle backward compatibility: convert single image to images array if needed
    const itemData = { ...item };
    if (itemData.image && !itemData.images) {
      itemData.images = [itemData.image];
      delete itemData.image;
    }
    if (!itemData.images) {
      itemData.images = [];
    }
    setFormData(itemData);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || formData.price === undefined || formData.price === null) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Name and Price are required.',
      });
      return;
    }
    setIsSaving(true);
    try {
      const dataToSave: any = { ...formData };

      if (editingItem && editingItem.id) {
        await updateCustomItem(editingItem.id, dataToSave);
        toast({ title: 'Success', description: 'Item updated.' });
      } else {
        await addCustomItem(dataToSave);
        toast({ title: 'Success', description: 'Item created.' });
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save item.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteCustomItem(id);
      setItems(items.filter((i) => i.id !== id));
      toast({ title: 'Deleted', description: 'Item removed.' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete item.',
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
        <h1 className="text-3xl font-bold font-headline">
          Manage Custom Items
        </h1>
        <Button onClick={openNewDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price (PKR)</TableHead>
                <TableHead>Variations</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No items found.
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="w-10 h-10 relative bg-muted rounded overflow-hidden">
                      {((item.images && item.images.length > 0) || item.image) ? (
                        <img
                          src={(item.images && item.images[0]) || item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[10px]">
                          No Img
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="capitalize">
                    {categories.find((c) => c.slug === item.category)?.name ||
                      item.category}
                  </TableCell>
                  <TableCell>{item.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help font-medium">
                            {item.variants?.length || 0}
                          </span>
                        </TooltipTrigger>
                        {item.variants && item.variants.length > 0 && (
                          <TooltipContent className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-medium text-xs mb-2">Variations:</p>
                              {item.variants.map((variant, index) => (
                                <div key={index} className="text-xs">
                                  <span className="font-medium">{variant.name}</span>
                                  <span className="text-muted-foreground ml-2">
                                    PKR {variant.price.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(item.id)}
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
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {editingItem ? 'Edit Item' : 'Create Item'}
            </DialogTitle>
            <DialogDescription>
              Add a snack or decoration for the custom builder.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-2 py-4">
            <div className="space-y-4">
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
                    value={formData.price || ''}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        setFormData({ ...formData, price: undefined });
                      }
                    }}
                    onBlur={(e) => {
                      if (!e.target.value) {
                        setFormData({ ...formData, price: 0 });
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, price: value ? Number(value) : 0 });
                    }}
                  />
                </div>
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
                    {itemCategories.length === 0 && (
                      <SelectItem value="chocolates">
                        Chocolates (Default)
                      </SelectItem>
                    )}
                    {itemCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4 border rounded-md p-4">
                <div className="flex justify-between items-center">
                  <Label>Variants (Optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVariant}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Variant
                  </Button>
                </div>
                
                {formData.variants && formData.variants.length > 0 ? (
                  <div className="space-y-3">
                    {formData.variants.map((variant, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Variant Name</Label>
                          <Input
                            value={variant.name}
                            placeholder="e.g. Small (50g)"
                            onChange={(e) =>
                              updateVariant(index, 'name', e.target.value)
                            }
                          />
                        </div>
                        <div className="w-24 space-y-1">
                          <Label className="text-xs">Price</Label>
                          <Input
                            type="number"
                            value={variant.price}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                'price',
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive mb-0.5"
                          onClick={() => removeVariant(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    No variants added. The main price above will be used.
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Images (Max 5)</Label>
                <div className="border p-4 rounded-md">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                    {(formData.images || []).map((imageUrl, index) => (
                      <div key={index} className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={imageUrl}
                          className="w-full h-full object-cover"
                          alt={`Image ${index + 1}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-0 right-0 h-5 w-5 bg-white/50 p-0"
                          onClick={() => {
                            const currentImages = formData.images || [];
                            setFormData({
                              ...formData,
                              images: currentImages.filter((_, i) => i !== index)
                            });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {(formData.images || []).length < 5 && (
                      <div className="w-20 h-20 bg-muted rounded flex items-center justify-center text-xs border-2 border-dashed border-muted-foreground/25">
                        Add Image
                      </div>
                    )}
                  </div>
                  {(formData.images || []).length < 5 && (
                    <div className="w-full">
                      <ImagePicker
                        onImageSelected={(url) => {
                          const currentImages = formData.images || [];
                          setFormData({
                            ...formData,
                            images: [...currentImages, url]
                          });
                        }}
                      />
                    </div>
                  )}
                  {(formData.images || []).length >= 5 && (
                    <p className="text-xs text-muted-foreground">
                      Maximum of 5 images reached. Delete an image to add a new one.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
