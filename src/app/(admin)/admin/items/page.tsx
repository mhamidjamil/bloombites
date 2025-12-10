'use client';

import { useState, useEffect } from 'react';
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
import ImageUpload from '@/components/image-upload';
import { useToast } from '@/hooks/use-toast';
import { 
  getCustomItems, 
  addCustomItem, 
  updateCustomItem, 
  deleteCustomItem,
  addSiteImage 
} from '@/lib/db-service';
import type { CustomItem } from '@/lib/types';

export default function AdminItemsPage() {
  const [items, setItems] = useState<CustomItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<CustomItem>>({
      name: '',
      price: 0,
      category: 'chocolates',
      image: ''
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getCustomItems();
      setItems(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load custom items." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewDialog = () => {
      setEditingItem(null);
      setFormData({
        name: '',
        price: 0,
        category: 'chocolates',
        image: ''
      });
      setIsDialogOpen(true);
  };

  const openEditDialog = (item: CustomItem) => {
      setEditingItem(item);
      setFormData({ ...item });
      setIsDialogOpen(true);
  };

   // Helper to save image to library history silently
   const saveToLibrary = async (url: string) => {
    try {
         const newImage = {
            url,
            name: 'Custom Item Image',
            description: 'Uploaded via items Page',
            uploadedAt: Date.now()
        };
        await addSiteImage(newImage);
    } catch(e) {
        console.error("Failed to save to library history", e);
    }
  };

  const handleSave = async () => {
      if (!formData.name || !formData.price) {
          toast({ variant: 'destructive', title: 'Validation Error', description: 'Name and Price are required.' });
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
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save item.' });
      } finally {
        setIsSaving(false);
      }
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Are you sure you want to delete this item?")) return;
      try {
          await deleteCustomItem(id);
          setItems(items.filter(i => i.id !== id));
          toast({ title: "Deleted", description: "Item removed." });
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Failed to delete item." });
      }
  };

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline">Manage Custom Items</h1>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No items found.</TableCell>
                  </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="w-10 h-10 relative bg-muted rounded overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : <div className="flex items-center justify-center h-full text-[10px]">No Img</div>}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="capitalize">
                    {item.category?.replace('-', ' ')}
                  </TableCell>
                  <TableCell>{item.price.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
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
        <DialogContent className="max-w-xl">
            <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Item' : 'Create Item'}</DialogTitle>
                <DialogDescription>Add a snack or decoration for the custom builder.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Price (PKR)</Label>
                        <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(val: any) => setFormData({...formData, category: val})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="chocolates">Chocolates</SelectItem>
                            <SelectItem value="snacks">Snacks</SelectItem>
                            <SelectItem value="dry-fruits">Dry Fruits</SelectItem>
                            <SelectItem value="notes-cards">Notes & Cards</SelectItem>
                            <SelectItem value="premium-add-ons">Premium Add-ons</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                     <Label>Image (Direct Upload)</Label>
                     <div className="flex gap-4 items-start border p-4 rounded-md">
                         {formData.image ? (
                             <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                                 <img src={formData.image} className="w-full h-full object-cover" />
                                 <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-5 w-5 bg-white/50 p-0" onClick={() => setFormData({...formData, image: ''})}>
                                     <X className="h-3 w-3" />
                                 </Button>
                             </div>
                         ) : <div className="w-20 h-20 bg-muted rounded flex items-center justify-center text-xs">No Img</div>}
                         <div className="flex-1">
                             <ImageUpload onUploadComplete={async (url) => {
                                 await saveToLibrary(url);
                                 setFormData({...formData, image: url});
                             }} />
                         </div>
                     </div>
                </div>
            </div>
            <DialogFooter>
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
