'use client';

import { useState, useEffect } from 'react';
import type { CustomItem, Category, ItemVariant } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Bot,
  Sparkles,
  ShoppingCart,
  Trash2,
  Loader2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateBouquetDescription } from '@/ai/flows/generate-bouquet-description';
import { Skeleton } from './ui/skeleton';
import {
  getCategories,
  getCustomItems,
  getBouquetStyles,
} from '@/lib/db-service';

type SelectedBouquetItem = {
  id: string; // Unique identifier for each selected item instance
  item: CustomItem;
  quantity: number;
  selectedVariant?: ItemVariant;
};

type BouquetStyle = {
  id: string;
  name: string;
  description: string;
  image?: string;
  price: number;
  isEnabled?: boolean;
};

export default function CustomBouquetBuilder() {
  const [currentStage, setCurrentStage] = useState<'items' | 'style'>('items');
  const [selectedItems, setSelectedItems] = useState<SelectedBouquetItem[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<BouquetStyle | null>(null);
  const [instructions, setInstructions] = useState('');
  const [aiName, setAiName] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<CustomItem[]>([]);
  const [bouquetStyles, setBouquetStyles] = useState<BouquetStyle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [dynamicHeading, setDynamicHeading] = useState(
    'Design your own unique snack bouquet from scratch'
  );
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedCategories, fetchedItems, fetchedStyles] =
          await Promise.all([
            getCategories(),
            getCustomItems(),
            getBouquetStyles(),
          ]);
        setCategories(fetchedCategories);
        setItems(fetchedItems);
        setBouquetStyles(fetchedStyles);
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

  // Dynamic heading effect
  useEffect(() => {
    if (categories.length === 0) return; // Wait for categories to load

    const adjectives = [
      'unique',
      'custom',
      'personalized',
      'special',
      'exclusive',
      'premium',
      'deluxe',
      'bespoke',
    ];
    const categoryNames = categories.map((cat) => cat.name.toLowerCase());

    // Create dynamic headings using category names
    const headings: string[] = [];
    adjectives.forEach((adjective) => {
      categoryNames.forEach((category) => {
        headings.push(
          `Design your own ${adjective} ${category} bouquet from scratch`
        );
      });
    });

    // If no categories, fallback to original headings
    const finalHeadings =
      headings.length > 0
        ? headings
        : [
            'Design your own unique snack bouquet from scratch',
            'Design your own custom snack bouquet from scratch',
            'Design your own personalized snack bouquet from scratch',
            'Design your own special snack bouquet from scratch',
          ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % finalHeadings.length;
      setDynamicHeading(finalHeadings[currentIndex]);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [categories]);

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getQuantity = (itemId: string, variantName?: string) => {
    const found = selectedItems.find(
      (item) =>
        item.item.id === itemId && item.selectedVariant?.name === variantName
    );
    return found ? found.quantity : 0;
  };

  const currentUpdateItemQuantity = (
    item: CustomItem,
    newQuantity: number,
    variant?: ItemVariant
  ) => {
    setSelectedItems((prev) => {
      // Check if this specific combination exists
      const existingIndex = prev.findIndex(
        (selected) =>
          selected.item.id === item.id &&
          selected.selectedVariant?.name === variant?.name
      );

      if (newQuantity <= 0) {
        // Remove
        if (existingIndex >= 0) {
          return prev.filter((_, i) => i !== existingIndex);
        }
        return prev;
      }

      // Update or Add
      if (existingIndex >= 0) {
        // Update
        const newItems = [...prev];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newQuantity,
        };
        return newItems;
      } else {
        // Add
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            item,
            quantity: newQuantity,
            selectedVariant: variant,
          },
        ];
      }
    });
  };

  const getItemPrice = (selectedItem: SelectedBouquetItem) => {
    return selectedItem.selectedVariant
      ? selectedItem.selectedVariant.price
      : selectedItem.item.price;
  };

  const itemsTotal = selectedItems.reduce(
    (acc, selectedItem) =>
      acc + getItemPrice(selectedItem) * selectedItem.quantity,
    0
  );

  const totalPrice = itemsTotal + (selectedStyle?.price || 0);

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
        items: selectedItems.map((selected) => selected.item.name),
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
    <div className="max-w-7xl mx-auto">
      {/* Dynamic Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground mb-4 transition-all duration-500 ease-in-out">
          {dynamicHeading}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Pick your favorite items and we&apos;ll craft it for you!
        </p>
      </div>

      {/* Progress and Step Details in One Row */}
      <div className="flex items-center justify-between mb-6 bg-muted/30 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold ${
              currentStage === 'items'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            1
          </div>
          <div
            className={`h-0.5 w-12 ${currentStage === 'style' ? 'bg-primary' : 'bg-muted'}`}
          />
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold ${
              currentStage === 'style'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            2
          </div>
        </div>

        <div className="text-center flex-1 mx-6">
          <h2 className="text-xl font-semibold mb-1">
            {currentStage === 'items'
              ? 'Select Your Items'
              : 'Choose Presentation Style'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {currentStage === 'items'
              ? 'Pick items and customize quantities'
              : 'Select how your bouquet will be presented'}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          {currentStage === 'style' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStage('items')}
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Back
            </Button>
          )}
          {currentStage === 'items' && selectedItems.length > 0 && (
            <Button size="sm" onClick={() => setCurrentStage('style')}>
              Next
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Grid - Sidebar Inline */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {currentStage === 'items' ? (
            // Item Selection Stage
            isLoading ? (
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                      {items
                        .filter((item) => item.category === cat.slug)
                        .map((item) => {
                          const hasVariants =
                            item.variants && item.variants.length > 0;
                          const isExpanded = expandedItems.includes(item.id);
                          const totalQty = selectedItems
                            .filter((s) => s.item.id === item.id)
                            .reduce((acc, s) => acc + s.quantity, 0);
                          const isSelected = totalQty > 0;

                          return (
                            <Card
                              key={item.id}
                              className={`transition-all duration-300 ${isSelected ? 'ring-2 ring-primary border-primary/50' : ''}`}
                            >
                              <CardContent className="p-3">
                                {/* Image Section */}
                                <div className="aspect-square relative w-full mb-3 bg-muted rounded-md overflow-hidden group">
                                  {(item.images && item.images.length > 0) ||
                                  item.image ? (
                                    <Image
                                      src={
                                        (item.images && item.images[0]) ||
                                        item.image!
                                      }
                                      alt={item.name}
                                      fill
                                      className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                      No Image
                                    </div>
                                  )}
                                  {isSelected && (
                                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                      {totalQty}
                                    </div>
                                  )}
                                </div>

                                {/* Header Section */}
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h3
                                      className="font-semibold text-sm truncate pr-2 max-w-[140px]"
                                      title={item.name}
                                    >
                                      {item.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                      from PKR {item.price}
                                    </p>
                                  </div>
                                  {hasVariants && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 -mr-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleItemExpansion(item.id);
                                      }}
                                    >
                                      {isExpanded ? (
                                        <ChevronUp className="h-4 w-4" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4" />
                                      )}
                                    </Button>
                                  )}
                                </div>

                                {/* Controls Section */}
                                <div className="space-y-2">
                                  {/* Simple Mode (No variants OR Toggle Header for Base Item) */}
                                  {(!hasVariants || isExpanded) && (
                                    <div className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                                      <span className="text-xs font-medium">
                                        Base Item{' '}
                                        <span className="text-muted-foreground font-normal">
                                          ({item.price})
                                        </span>
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() =>
                                            currentUpdateItemQuantity(
                                              item,
                                              getQuantity(item.id) - 1
                                            )
                                          }
                                        >
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-4 text-center text-xs font-medium">
                                          {getQuantity(item.id)}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() =>
                                            currentUpdateItemQuantity(
                                              item,
                                              getQuantity(item.id) + 1
                                            )
                                          }
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Variants List (Only if Expanded) */}
                                  {hasVariants && isExpanded && (
                                    <div className="space-y-2 border-t pt-2 mt-2">
                                      {item.variants?.map((variant, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center justify-between bg-muted/30 p-2 rounded-md"
                                        >
                                          <div className="flex flex-col">
                                            <span
                                              className="text-xs font-medium truncate max-w-[80px]"
                                              title={variant.name}
                                            >
                                              {variant.name}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                              PKR {variant.price}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6"
                                              onClick={() =>
                                                currentUpdateItemQuantity(
                                                  item,
                                                  getQuantity(
                                                    item.id,
                                                    variant.name
                                                  ) - 1,
                                                  variant
                                                )
                                              }
                                            >
                                              <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-4 text-center text-xs font-medium">
                                              {getQuantity(
                                                item.id,
                                                variant.name
                                              )}
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6"
                                              onClick={() =>
                                                currentUpdateItemQuantity(
                                                  item,
                                                  getQuantity(
                                                    item.id,
                                                    variant.name
                                                  ) + 1,
                                                  variant
                                                )
                                              }
                                            >
                                              <Plus className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Show expand prompt if closed */}
                                  {hasVariants && !isExpanded && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full text-xs h-7"
                                      onClick={() =>
                                        toggleItemExpansion(item.id)
                                      }
                                    >
                                      View Variations
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      {items.filter((item) => item.category === cat.slug)
                        .length === 0 && (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                          No items available in this category.
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )
          ) : (
            // Style Selection Stage
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bouquetStyles
                .filter((style) => style.isEnabled !== false)
                .map((style) => (
                  <Card
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`cursor-pointer transition-all ${
                      selectedStyle?.id === style.id
                        ? 'ring-2 ring-primary'
                        : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">
                          {style.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {style.description}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          PKR {style.price}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          {/* AI Assistant and Instructions - Only in Style Stage */}
          {currentStage === 'style' && (
            <div className="mt-6 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <Bot className="h-5 w-5" /> AI Assistant
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
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
                      <div className="bg-muted/30 p-3 rounded-md border text-sm mb-4">
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
                    {isGenerating
                      ? 'Generating...'
                      : 'Generate Name & Description'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Special Instructions
                  </h3>
                  <Textarea
                    placeholder="e.g., 'Make it a birthday theme with gold wrapping'"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="min-h-[80px]"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Compact Sidebar */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-3">
                {currentStage === 'items' ? 'Your Selection' : 'Order Summary'}
              </h3>

              {currentStage === 'items' ? (
                // Items Stage Sidebar - Compact
                <>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {selectedItems.length > 0 ? (
                      selectedItems.map((selectedItem) => (
                        <div
                          key={selectedItem.id}
                          className="flex items-center justify-between py-2 border-b border-border/50"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {selectedItem.item.name}
                            </p>
                            {selectedItem.selectedVariant && (
                              <p className="text-xs text-muted-foreground">
                                {selectedItem.selectedVariant.name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() =>
                                  currentUpdateItemQuantity(
                                    selectedItem.item,
                                    selectedItem.quantity - 1,
                                    selectedItem.selectedVariant
                                  )
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-xs">
                                {selectedItem.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-5 w-5"
                                onClick={() =>
                                  currentUpdateItemQuantity(
                                    selectedItem.item,
                                    selectedItem.quantity + 1,
                                    selectedItem.selectedVariant
                                  )
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 text-destructive"
                              onClick={() =>
                                currentUpdateItemQuantity(
                                  selectedItem.item,
                                  0,
                                  selectedItem.selectedVariant
                                )
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No items selected
                      </p>
                    )}
                  </div>

                  {selectedItems.length > 0 && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">Items Total:</span>
                        <span className="font-semibold">
                          PKR {itemsTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Style Stage Sidebar - Compact
                <>
                  <div className="space-y-3">
                    {selectedStyle ? (
                      <div className="border rounded-md p-3 bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {selectedStyle.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {selectedStyle.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t">
                          <span className="text-xs">Style Price:</span>
                          <span className="font-medium text-sm">
                            PKR {selectedStyle.price}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Choose a style
                      </p>
                    )}

                    <div className="border-t pt-3 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Price:</span>
                        <span className="font-bold text-lg">
                          PKR {totalPrice.toLocaleString()}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        className="w-full"
                        disabled={!selectedStyle}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
