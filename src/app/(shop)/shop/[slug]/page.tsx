'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Minus, Plus, ShoppingCart, AlertTriangle } from 'lucide-react';
import BouquetCard from '@/components/bouquet-card';
import useCartStore from '@/lib/cart-store';
import { useToast } from '@/hooks/use-toast';
import { getBouquets } from '@/lib/db-service';
import type { Bouquet } from '@/lib/types';

export default function BouquetDetailsPage() {
  const params = useParams<{ slug: string }>();
  const [bouquets, setBouquets] = useState<Bouquet[] | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>(
    'loading'
  );
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();

  const load = async () => {
    setStatus('loading');
    try {
      const data = await getBouquets();
      setBouquets(data);
      setStatus('ready');
    } catch (error) {
      console.error('shop-detail.getBouquets failed', {
        operation: 'getBouquets',
        slug: params.slug,
        error,
      });
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
        <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
        <p className="text-lg font-semibold mb-2">Could not load this product</p>
        <p className="text-muted-foreground mb-6">Please try again.</p>
        <Button onClick={load}>Retry</Button>
      </div>
    );
  }

  const bouquet = bouquets?.find(
    (b) => b.slug === params.slug && b.isEnabled !== false
  );

  if (!bouquet) {
    notFound();
  }

  const relatedBouquets = (bouquets ?? [])
    .filter(
      (b) =>
        b.isEnabled !== false &&
        b.category === bouquet.category &&
        b.id !== bouquet.id
    )
    .slice(0, 3);

  const imageUrl = bouquet.images?.[0];

  const handleAddToCart = () => {
    addItem(bouquet, quantity);
    toast({
      title: 'Added to cart',
      description: `${quantity} x ${bouquet.name} added to your cart.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square relative mb-4 rounded-lg overflow-hidden shadow-lg bg-muted">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={bouquet.name}
                fill
                className="object-cover"
                unoptimized={imageUrl.startsWith('http')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                No Image
              </div>
            )}
          </div>
          {bouquet.images && bouquet.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {bouquet.images.map((img, index) => (
                <div
                  key={index}
                  className="aspect-square relative rounded-md overflow-hidden border-2 border-primary"
                >
                  <Image
                    src={img}
                    alt={`${bouquet.name} - view ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized={img.startsWith('http')}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bouquet Info */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline text-accent-foreground">
            {bouquet.name}
          </h1>
          <p className="text-3xl font-bold font-headline text-primary mt-2">
            PKR {bouquet.price.toLocaleString()}
          </p>
          <p className="mt-4 text-muted-foreground">{bouquet.description}</p>

          {bouquet.items && bouquet.items.length > 0 && (
            <>
              <Separator className="my-6" />
              <h2 className="text-xl font-bold font-headline text-accent-foreground">
                What&apos;s Inside?
              </h2>
              <ul className="mt-4 space-y-2">
                {bouquet.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <Separator className="my-6" />

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 border rounded-md p-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-bold text-lg w-8 text-center">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button size="lg" className="flex-grow" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Related Bouquets */}
      {relatedBouquets.length > 0 && (
        <div className="mt-24">
          <h2 className="text-3xl font-bold font-headline text-center text-accent-foreground">
            You Might Also Like
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedBouquets.map((related) => (
              <BouquetCard key={related.id} bouquet={related} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
