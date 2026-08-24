'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Package,
  ShoppingBasket,
  Users,
  Image as ImageIcon,
  Trash2,
  Copy,
  Loader2,
  X,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ImagePicker from '@/components/image-picker';
import {
  getLandingPageData,
  updateLandingPageData,
  getSiteImages,
  addSiteImage,
  deleteSiteImage,
  getBouquets,
  getCustomItems,
  getOrders,
  type SiteImage,
} from '@/lib/db-service';
import type { Order } from '@/lib/types';

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

  // Overview State
  const [stats, setStats] = useState({
    bouquets: 0,
    items: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [content, fetchedImages, fetchedBouquets, fetchedCustomItems, fetchedOrders] =
        await Promise.all([
          getLandingPageData(),
          getSiteImages(),
          getBouquets(),
          getCustomItems(),
          getOrders(),
        ]);

      // Load Content
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

      setImages(fetchedImages);
      setStats({
        bouquets: fetchedBouquets.length,
        items: fetchedCustomItems.length,
        pendingOrders: fetchedOrders.filter((o) => o.status === 'Pending')
          .length,
      });
      setRecentOrders(fetchedOrders.slice(0, 5));
    } catch (error) {
      console.error('admin-dashboard.loadData failed', {
        operation: 'loadData',
        error,
      });
      toast({
        variant: 'destructive',
        title: 'Error loading data',
        description: 'Could not fetch dashboard data.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Content Handlers ---
  const handleSaveContent = async () => {
    setIsSavingContent(true);
    try {
      await updateLandingPageData({
        hero: {
          title: heroTitle,
          subtitle: heroSubtitle,
          imageUrl: heroImageUrls[0] || '', // Backward compat
          imageUrls: heroImageUrls,
        },
        featured: { showPromo, promoImageUrl },
      });
      toast({
        title: 'Dashboard Updated',
        description: 'Content changes have been saved successfully.',
      });
    } catch (error) {
      console.error('admin-dashboard.saveContent failed', {
        operation: 'updateLandingPageData',
        error,
      });
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not update content.',
      });
    } finally {
      setIsSavingContent(false);
    }
  };

  const addHeroImage = (url: string) => {
    setHeroImageUrls((prev) => [...prev, url]);
    toast({ title: 'Image Added', description: 'Hero image added.' });
  };

  const removeHeroImage = (index: number) => {
    setHeroImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Image Handlers ---
  const handleImageUploaded = async (url: string) => {
    try {
      const exists = images.find((i) => i.url === url);
      if (!exists) {
        const newImage = {
          url,
          name: 'Added Image',
          description: 'Start managing this image',
          uploadedAt: Date.now(),
        };
        await addSiteImage(newImage);
        const fresh = await getSiteImages();
        setImages(fresh);
        toast({
          title: 'Image Saved',
          description: 'Image added to library.',
        });
      }
    } catch (error) {
      console.error('admin-dashboard.addSiteImage failed', {
        operation: 'addSiteImage',
        url,
        error,
      });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save image to the library.',
      });
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      await deleteSiteImage(id);
      setImages(images.filter((img) => img.id !== id));
      toast({
        title: 'Image Deleted',
        description: 'Image removed from library.',
      });
    } catch (error) {
      console.error('admin-dashboard.deleteSiteImage failed', {
        operation: 'deleteSiteImage',
        imageId: id,
        error,
      });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete image.',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Image URL copied to clipboard.' });
  };

  const filteredImages = images.filter(
    (img) =>
      img.name?.toLowerCase().includes(imageSearch.toLowerCase()) ||
      img.description?.toLowerCase().includes(imageSearch.toLowerCase())
  );

  const statCards = [
    { title: 'Total Bouquets', count: stats.bouquets, icon: Package },
    { title: 'Total Items', count: stats.items, icon: ShoppingBasket },
    { title: 'Pending Orders', count: stats.pendingOrders, icon: Users },
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
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((stat) => (
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
              <CardDescription>Latest orders.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No orders yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {order.customerDetails.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.orderNumber} • {order.status}
                        </p>
                      </div>
                      <div className="text-sm font-bold">
                        PKR {order.totalAmount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                <Label>Hero Images</Label>
                <CardDescription className="mb-2">
                  Upload or paste links for hero slideshow.
                </CardDescription>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {heroImageUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-video bg-muted rounded-md overflow-hidden group border"
                    >
                      <img
                        src={url}
                        className="object-cover w-full h-full"
                        alt="Hero"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeHeroImage(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 border border-dashed rounded-md bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="text-sm font-medium mb-4 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Add New Hero Image
                  </div>
                  <ImagePicker onImageSelected={addHeroImage} />
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
                      Show &quot;Build Custom Bouquet&quot; Promo Section
                    </Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Promo Image</Label>
                    <div className="flex gap-4 items-start flex-col md:flex-row">
                      {promoImageUrl && (
                        <div className="relative w-full md:w-48 aspect-video rounded-md overflow-hidden border shrink-0">
                          <img
                            src={promoImageUrl}
                            className="object-cover w-full h-full"
                            alt="Promo"
                          />
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
                      <div className="flex-1 w-full">
                        <ImagePicker onImageSelected={setPromoImageUrl} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveContent} disabled={isSavingContent}>
                {isSavingContent && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* IMAGES TAB */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Image Library</CardTitle>
              <CardDescription>
                Manage images used across the site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Add New Image</Label>
                  <ImagePicker onImageSelected={handleImageUploaded} />
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
                    No images found.
                  </div>
                )}
                {filteredImages.map((img) => (
                  <div
                    key={img.id}
                    className="flex gap-4 border p-4 rounded-lg items-center bg-card/50"
                  >
                    <div className="relative h-24 w-24 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-grow flex items-center justify-between gap-4 min-w-0">
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{img.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {new Date(img.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => copyToClipboard(img.url)}
                        >
                          <Copy className="h-3 w-3 mr-1" /> Copy URL
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 px-2"
                          onClick={() => img.id && handleDeleteImage(img.id)}
                        >
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
