'use client';

import { useState, useEffect } from 'react';
import type { CustomItem, Category } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Bot, Sparkles, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateBouquetDescription } from '@/ai/flows/generate-bouquet-description';
import { Skeleton } from './ui/skeleton';
import { getCategories, getCustomItems } from '@/lib/db-service';

export default function CustomBouquetBuilder() {
  const [selectedItems, setSelectedItems] = useState<CustomItem[]>([]);
  const [instructions, setInstructions] = useState('');
  const [aiName, setAiName] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<CustomItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedCategories, fetchedItems] = await Promise.all([
          getCategories(),
          getCustomItems(),
        ]);
        setCategories(fetchedCategories);
        setItems(fetchedItems);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load categories and items.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleItemToggle = (item: CustomItem) => {
    setSelectedItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  };

  const totalPrice = selectedItems.reduce((acc, item) => acc + item.price, 0);

  const handleGenerateDescription = async () => {
    if (selectedItems.length < 2) {
      toast({
        variant: 'destructive',
        title: 'Not enough items',
        description:
          'Please select at least 2 items to generate a description.',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateBouquetDescription({
        items: selectedItems.map((i) => i.name),
        theme: instructions || 'A lovely gift',
      });
      setAiName(result.name);
      setAiDescription(result.description);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate a description. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Item Selection */}
      <div className="lg:col-span-2">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        ) : (
          <Tabs defaultValue={categories[0]?.slug || 'chocolates'}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
              {categories.map((cat) => (
                <TabsTrigger key={cat.slug} value={cat.slug}>
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((cat) => (
              <TabsContent key={cat.slug} value={cat.slug}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {items
                    .filter((item) => item.category === cat.slug)
                    .map((item) => {
                      const isSelected = selectedItems.some(
                        (i) => i.id === item.id
                      );
                      return (
                        <Card
                          key={item.id}
                          onClick={() => handleItemToggle(item)}
                          className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
                        >
                          <CardContent className="p-2 relative">
                            <Checkbox
                              checked={isSelected}
                              className="absolute top-2 right-2 z-10"
                            />
                            <div className="aspect-square relative w-full mb-2">
                              {item.image && (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover rounded-md"
                                />
                              )}
                            </div>
                            <h3 className="font-semibold text-sm truncate">
                              {item.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              PKR {item.price}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  {items.filter((item) => item.category === cat.slug).length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No items available in this category.
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      {/* Summary & Checkout */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold font-headline mb-4">
              Your Custom Bouquet
            </h2>
            <div className="min-h-[100px] max-h-[200px] overflow-y-auto space-y-2 pr-2">
              {selectedItems.length > 0 ? (
                selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span>{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        PKR {item.price}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleItemToggle(item)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Select items to get started!
                </p>
              )}
            </div>

            <div className="border-t my-4 pt-4 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Bot className="h-5 w-5" /> AI Assistant
              </h3>
              <p className="text-xs text-muted-foreground">
                Add a theme or occasion below, then generate a name and
                description for your unique bouquet!
              </p>

              {isGenerating ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                (aiName || aiDescription) && (
                  <div className="bg-background p-3 rounded-md border text-sm">
                    {aiName && <h4 className="font-bold">{aiName}</h4>}
                    {aiDescription && (
                      <p className="text-muted-foreground mt-1">
                        {aiDescription}
                      </p>
                    )}
                  </div>
                )
              )}

              <Button
                onClick={handleGenerateDescription}
                disabled={isGenerating}
                className="w-full"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate Name & Description'}
              </Button>
            </div>

            <div className="border-t my-4 pt-4">
              <h3 className="text-lg font-semibold mb-2">
                Special Instructions
              </h3>
              <Textarea
                placeholder="e.g., 'Make it a birthday theme with gold wrapping'"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            <div className="border-t my-4 pt-4 flex justify-between items-center text-xl font-bold">
              <span>Total Price:</span>
              <span>PKR {totalPrice.toLocaleString()}</span>
            </div>
            <Button
              size="lg"
              className="w-full mt-4"
              disabled={selectedItems.length === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
