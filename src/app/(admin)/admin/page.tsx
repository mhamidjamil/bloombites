"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { featuredBouquets, customItems, orders, bouquets } from "@/lib/mock-data";
import { placeholderImages } from "@/lib/placeholder-images";
import { Package, ShoppingBasket, Users, Image as ImageIcon, LayoutDashboard, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast"; // Assuming this hook exists or I will use simple alert if not

export default function AdminDashboardPage() {
    // Mock state for content
    const [heroTitle, setHeroTitle] = useState("Edible Art, Deliciously Delivered.");
    const [heroSubtitle, setHeroSubtitle] = useState("Surprise your loved ones with our handcrafted snack bouquets.");
    const [imageSearch, setImageSearch] = useState("");
    const { toast } = useToast();

    const stats = [
        {
            title: "Total Bouquets",
            count: bouquets.length,
            icon: Package,
        },
        {
            title: "Total Items",
            count: customItems.length,
            icon: ShoppingBasket,
        },
        {
            title: "Pending Orders",
            count: orders.filter(o => o.status === 'processing').length,
            icon: Users,
        }
    ];

    const handleSaveContent = () => {
        toast({
            title: "Dashboard Updated",
            description: "Content changes have been saved successfully.",
        });
    };

    const handleUpdateImage = (id: string, newUrl: string) => {
        // In a real app, this would update the DB
        console.log(`Updating image ${id} to ${newUrl}`);
        toast({
            title: "Image Updated",
            description: `Image '${id}' has been updated.`,
        });
    };

    const filteredImages = placeholderImages.filter(img => 
        img.id.toLowerCase().includes(imageSearch.toLowerCase()) || 
        img.description.toLowerCase().includes(imageSearch.toLowerCase())
    );

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold font-headline">Admin Dashboard</h1>
                <div className="text-muted-foreground">
                    Welcome back, Admin
                </div>
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
                        {stats.map(stat => (
                            <Card key={stat.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
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
                            <CardDescription>Latest orders and system events.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {orders.slice(0, 5).map(order => (
                                    <div key={order.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium text-sm">{order.customerDetails.name}</p>
                                            <p className="text-xs text-muted-foreground">{order.id} • {order.status}</p>
                                        </div>
                                        <div className="text-sm font-bold">
                                            PKR {order.totalAmount.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                                {orders.length === 0 && <p className="text-sm text-muted-foreground">No recent orders.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CONTENT TAB */}
                <TabsContent value="content">
                    <Card>
                        <CardHeader>
                            <CardTitle>Landing Page Content</CardTitle>
                            <CardDescription>Update text and featured sections on the homepage.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                            
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">Featured Settings</h3>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="show-promo" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                                    <Label htmlFor="show-promo">Show "Build Custom Bouquet" Promo Section</Label>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveContent}>
                                <Save className="mr-2 h-4 w-4" /> Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* IMAGES TAB */}
                <TabsContent value="images">
                    <Card>
                        <CardHeader>
                            <CardTitle>Image Library</CardTitle>
                            <CardDescription>Manage images used across the site.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center space-x-2">
                                <Input 
                                    placeholder="Search images..." 
                                    value={imageSearch}
                                    onChange={(e) => setImageSearch(e.target.value)}
                                    className="max-w-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-2">
                                {filteredImages.map((img) => (
                                    <div key={img.id} className="flex gap-4 border p-4 rounded-lg items-start bg-card/50">
                                        <div className="relative h-24 w-24 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                                            {/* We use img tag here for simplicity in admin panel if next/image fits awkwardly or needs known dimensions */}
                                            <img 
                                                src={img.imageUrl} 
                                                alt={img.description} 
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                        <div className="flex-grow space-y-2">
                                            <div>
                                                <p className="font-bold text-sm">{img.id}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-1">{img.description}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor={`url-${img.id}`} className="text-xs">Image URL</Label>
                                                <div className="flex gap-2">
                                                    <Input 
                                                        id={`url-${img.id}`} 
                                                        defaultValue={img.imageUrl} 
                                                        className="h-8 text-xs font-mono"
                                                    />
                                                    <Button size="sm" variant="secondary" className="h-8" onClick={() => handleUpdateImage(img.id, "new-url-here")}>
                                                        Update
                                                    </Button>
                                                </div>
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
