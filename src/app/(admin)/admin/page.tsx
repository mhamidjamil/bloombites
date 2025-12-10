'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { orders, bouquets as mockBouquets, customItems } from '@/lib/mock-data';
import {
  Package,
  ShoppingBasket,
  Users,
  Image as ImageIcon,
  LayoutDashboard,
  Save,
  Trash2,
  Copy,
  Plus,
  Pencil,
  MoreHorizontal,
  Loader2,
  X
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/image-upload';
import { 
  getLandingPageData, 
  updateLandingPageData, 
  getSiteImages, 
  addSiteImage,
  deleteSiteImage, 
  getBouquets,
  addProduct,
  updateProduct,
  deleteProduct,
  type SiteImage 
} from '@/lib/db-service';
import type { Bouquet } from '@/lib/types';

export default function AdminDashboardPage() {
  // Content State
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImageUrls, setHeroImageUrls] = useState<string[]>([]);
  const [showPromo, setShowPromo] = useState(true);
  const [promoImageUrl, setPromoImageUrl] = useState('');
  const [isSavingContent, setIsSavingContent] = useState(false);
  
  // Images State
  const [images, setImages] = useState<SiteImage[]>([]);
  const [imageSearch, setImageSearch] = useState('');

  // Products State
  const [products, setProducts] = useState<Bouquet[]>([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Bouquet | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  
  // Product Form State
  const [productForm, setProductForm] = useState<Partial<Bouquet>>({
      name: '',
      description: '',
      price: 0,
      category: 'mixed',
      images: [],
      isFeatured: false,
      isEnabled: true,
      items: []
  });

  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load Content
      const content = await getLandingPageData();
      if (content) {
        setHeroTitle(content.hero?.title || '');
        setHeroSubtitle(content.hero?.subtitle || '');
        
        // Handle migration from single URL to Array
        if (content.hero?.imageUrls && content.hero.imageUrls.length > 0) {
            setHeroImageUrls(content.hero.imageUrls);
        } else if (content.hero?.imageUrl) {
            setHeroImageUrls([content.hero.imageUrl]);
        }
        
        setShowPromo(content.featured?.showPromo ?? true);
        setPromoImageUrl(content.featured?.promoImageUrl || '');
      }

      // Load Images
      const fetchedImages = await getSiteImages();
      setImages(fetchedImages);

      // Load Products
      const fetchedProducts = await getBouquets();
      setProducts(fetchedProducts);

    } catch (error) {
        console.error("Failed to load admin data", error);
        toast({
            variant: "destructive",
            title: "Error loading data",
            description: "Could not fetch dashboard data."
        });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Helper: Save uploaded image to library silently ---
  const saveToLibrary = async (url: string) => {
    try {
         const newImage = {
            url,
            name: 'Direct Upload',
            description: 'Uploaded via Content/Product Editor',
            uploadedAt: Date.now()
        };
        await addSiteImage(newImage);
        // Refresh library in background
        getSiteImages().then(setImages);
    } catch(e) {
        console.error("Failed to save to library history", e);
    }
  };

  // --- Content Handlers ---
  const handleSaveContent = async () => {
    setIsSavingContent(true);
    try {
        await updateLandingPageData({
            hero: { 
                title: heroTitle, 
                subtitle: heroSubtitle, 
                imageUrl: heroImageUrls[0] || '', // Backward compat
                imageUrls: heroImageUrls 
            },
            featured: { showPromo, promoImageUrl }
        });
        toast({
            title: 'Dashboard Updated',
            description: 'Content changes have been saved successfully.',
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not update content."
        });
    } finally {
        setIsSavingContent(false);
    }
  };

  const addHeroImage = async (url: string) => {
      await saveToLibrary(url);
      setHeroImageUrls(prev => [...prev, url]);
      toast({ title: 'Image Added', description: 'Hero image added.' });
  };

  const removeHeroImage = (index: number) => {
      setHeroImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // --- Image Handlers ---
  const handleImageUploaded = async (url: string) => {
    try {
        const newImage = {
            url,
            name: 'Uploaded Image',
            description: 'Uploaded via Admin Dashboard',
            uploadedAt: Date.now()
        };
        await addSiteImage(newImage);
        toast({
            title: 'Image Saved',
            description: 'Image has been uploaded and saved to library.',
        });
        // Refresh images
        const fetchedImages = await getSiteImages();
        setImages(fetchedImages);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save image record."
        });
    }
  };

  const handleDeleteImage = async (id: string) => {
      try {
          await deleteSiteImage(id);
          setImages(images.filter(img => img.id !== id));
          toast({ title: "Image Deleted", description: "Image removed from library." });
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Failed to delete image." });
      }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Image URL copied to clipboard." });
  };

  // --- Product Handlers ---
  const openNewProductDialog = () => {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: 0,
        category: 'mixed',
        images: [''],
        isFeatured: false,
        isEnabled: true,
        items: []
      });
      setIsProductDialogOpen(true);
  };

  const openEditProductDialog = (product: Bouquet) => {
      setEditingProduct(product);
      setProductForm({ ...product });
      setIsProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
      if (!productForm.name || !productForm.price) {
          toast({ variant: 'destructive', title: 'Validation Error', description: 'Name and Price are required.' });
          return;
      }
      setIsSavingProduct(true);

      try {
        const slug = productForm.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const dataToSave: any = {
            ...productForm,
            slug,
            items: productForm.items || [],
        };

        if (editingProduct && editingProduct.id) {
            await updateProduct(editingProduct.id, dataToSave);
            toast({ title: 'Product Updated', description: `${productForm.name} saved.` });
        } else {
            await addProduct(dataToSave);
            toast({ title: 'Product Created', description: `${productForm.name} created.` });
        }

        // Refresh
        const fetchedProducts = await getBouquets();
        setProducts(fetchedProducts);
        setIsProductDialogOpen(false);

      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save product.' });
      } finally {
        setIsSavingProduct(false);
      }
  };

  const handleDeleteProduct = async (id: string) => {
      if(!confirm("Are you sure you want to delete this product?")) return;
      try {
          await deleteProduct(id);
          setProducts(products.filter(p => p.id !== id));
          toast({ title: "Product Deleted", description: "Product has been removed." });
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Failed to delete product." });
      }
  };

  const filteredImages = images.filter(
    (img) =>
      img.name?.toLowerCase().includes(imageSearch.toLowerCase()) ||
      img.description?.toLowerCase().includes(imageSearch.toLowerCase())
  );

  const stats = [
    {
      title: 'Total Bouquets',
      count: products.length || mockBouquets.length, // Fallback purely visual for now
      icon: Package,
    },
    {
      title: 'Total Items',
      count: customItems.length, // Placeholder
      icon: ShoppingBasket,
    },
    {
      title: 'Pending Orders',
      count: orders.filter((o) => o.status === 'processing').length,
      icon: Users,
    },
  ];

  if (isLoading) {
      return (
          <div className="flex items-center justify-center min-h-[60vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span>Loading dashboard...</span>
          </div>
      );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold font-headline">Admin Dashboard</h1>
        <div className="text-muted-foreground">Welcome back, Admin</div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.count}</div>
                </CardContent>
              </Card>
            ))}
          </div>
           <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest orders and system events. (Mock Data)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {order.customerDetails.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.id} • {order.status}
                      </p>
                    </div>
                    <div className="text-sm font-bold">
                      PKR {order.totalAmount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTENT TAB */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Landing Page Content</CardTitle>
              <CardDescription>
                Update text and featured sections on the homepage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-4">
                <div className="space-y-2">
                    <Label htmlFor="hero-title">Hero Title</Label>
                    <Input
                    id="hero-title"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
                    <Input
                    id="hero-subtitle"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hero Images (Direct Upload)</Label>
                <CardDescription className="mb-2">Upload multiple images for the home page slideshow.</CardDescription>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {heroImageUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-video bg-muted rounded-md overflow-hidden group border">
                            <img src={url} className="object-cover w-full h-full" alt="Hero" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <Button variant="destructive" size="icon" onClick={() => removeHeroImage(idx)}>
                                    <Trash2 className="h-4 w-4"/>
                                 </Button>
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center justify-center p-4 border border-dashed rounded-md bg-muted/20 hover:bg-muted/40 transition-colors">
                        <div className="text-center w-full">
                            <ImageUpload onUploadComplete={addHeroImage} />
                            <p className="text-xs text-muted-foreground mt-2">New Upload</p>
                        </div>
                    </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Featured Settings
                </h3>
                <div className="grid gap-6">
                    <div className="flex items-center space-x-2">
                        <Switch 
                            id="show-promo" 
                            checked={showPromo} 
                            onCheckedChange={setShowPromo} 
                        />
                        <Label htmlFor="show-promo">
                            Show "Build Custom Bouquet" Promo Section
                        </Label>
                    </div>
                    <div className="space-y-2">
                        <Label>Promo Image (Direct Upload)</Label>
                        <div className="flex gap-4 items-start">
                            {promoImageUrl && (
                                <div className="relative w-32 h-32 rounded-md overflow-hidden border">
                                    <img src={promoImageUrl} className="object-cover w-full h-full" alt="Promo" />
                                     <Button 
                                        variant="destructive" 
                                        size="icon" 
                                        className="absolute top-1 right-1 h-6 w-6" 
                                        onClick={() => setPromoImageUrl('')}
                                     >
                                        <X className="h-3 w-3" />
                                     </Button>
                                </div>
                            )}
                            <ImageUpload 
                                onUploadComplete={async (url) => {
                                    await saveToLibrary(url);
                                    setPromoImageUrl(url);
                                }} 
                            />
                        </div>
                    </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveContent} disabled={isSavingContent}>
                {isSavingContent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* PRODUCTS TAB */}
        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Products Management</CardTitle>
                <CardDescription>
                  Manage bouquets and products.
                </CardDescription>
              </div>
              <Button onClick={openNewProductDialog}>
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.length === 0 && <div className="col-span-3 text-center py-10">No products found. Add one!</div>}
                    {products.map(product => (
                        <Card key={product.id} className="relative">
                            <CardHeader className="pb-2">
                                <div className="absolute top-4 right-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEditProductDialog(product)}>Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProduct(product.id)}>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardTitle className="text-lg">{product.name}</CardTitle>
                                <CardDescription className="line-clamp-1">{product.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="w-full h-32 bg-muted rounded-md mb-2 overflow-hidden">
                                    <img src={product.images[0] || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <p className="font-bold">PKR {product.price}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
          </Card>

           {/* Product Edit Dialog */}
           <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                        <DialogDescription>Fill in the details for the bouquet.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="p-name">Name</Label>
                                <Input id="p-name" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="p-price">Price (PKR)</Label>
                                <Input id="p-price" type="number" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="p-desc">Description</Label>
                            <Textarea id="p-desc" value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="p-cat">Category</Label>
                            <Select value={productForm.category} onValueChange={(val: any) => setProductForm({...productForm, category: val})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="chocolates">Chocolates</SelectItem>
                                    <SelectItem value="chips">Chips</SelectItem>
                                    <SelectItem value="mixed">Mixed</SelectItem>
                                    <SelectItem value="premium">Premium</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <Label>Product Image (Direct Upload)</Label>
                             <div className="flex items-start gap-4 p-4 border rounded-md">
                                 {productForm.images && productForm.images[0] ? (
                                     <div className="relative w-24 h-24 rounded overflow-hidden">
                                         <img src={productForm.images[0]} className="w-full h-full object-cover" alt="Product" />
                                         <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-5 w-5 bg-white/50 hover:bg-white" onClick={() => setProductForm({...productForm, images: []})}>
                                            <X className="h-3 w-3"/>
                                         </Button>
                                     </div>
                                 ) : (
                                     <div className="text-sm text-muted-foreground self-center">No image selected</div>
                                 )}
                                 <div className="flex-1">
                                    <ImageUpload onUploadComplete={async (url) => {
                                         await saveToLibrary(url);
                                         setProductForm({...productForm, images: [url]});
                                    }} />
                                    <p className="text-xs text-muted-foreground mt-2">Upload replaces current image.</p>
                                 </div>
                             </div>
                        </div>
                        <div className="flex items-center space-x-2">
                             <Switch id="p-featured" checked={productForm.isFeatured} onCheckedChange={(checked) => setProductForm({...productForm, isFeatured: checked})} />
                             <Label htmlFor="p-featured">Featured Product</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveProduct} disabled={isSavingProduct}>
                            {isSavingProduct && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TabsContent>

        {/* IMAGES TAB */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Image Library</CardTitle>
              <CardDescription>
                Manage images used across the site. Uploaded images are stored in Cloudflare R2.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-end gap-4">
                 <div className="flex-1 space-y-2">
                    <Label>Upload New Image</Label>
                    <ImageUpload onUploadComplete={handleImageUploaded} />
                 </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-4">
                <Input
                  placeholder="Search images..."
                  value={imageSearch}
                  onChange={(e) => setImageSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-2">
                {filteredImages.length === 0 && (
                    <div className="col-span-2 text-center text-muted-foreground py-8">
                        No images found. Upload one to get started!
                    </div>
                )}
                {filteredImages.map((img) => (
                  <div
                    key={img.id}
                    className="flex gap-4 border p-4 rounded-lg items-start bg-card/50"
                  >
                    <div className="relative h-24 w-24 flex-shrink-0 bg-muted rounded-md overflow-hidden group">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-grow space-y-2 min-w-0">
                      <div>
                        <p className="font-bold text-sm truncate">{img.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {new Date(img.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                         <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => copyToClipboard(img.url)}>
                            <Copy className="h-3 w-3 mr-1" /> Copy URL
                         </Button>
                         <Button size="sm" variant="destructive" className="h-8 px-2" onClick={() => img.id && handleDeleteImage(img.id)}>
                            <Trash2 className="h-3 w-3" />
                         </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
