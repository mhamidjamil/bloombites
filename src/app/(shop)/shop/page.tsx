'use client';

import { useEffect, useMemo, useState } from 'react';
import BouquetCard from '@/components/bouquet-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, PackageSearch } from 'lucide-react';
import { getBouquets } from '@/lib/db-service';
import type { Bouquet } from '@/lib/types';

const PRICE_FILTERS: Record<string, (price: number) => boolean> = {
  all: () => true,
  'under-2000': (price) => price < 2000,
  '2000-4000': (price) => price >= 2000 && price <= 4000,
  'over-4000': (price) => price > 4000,
};

export default function ShopPage() {
  const [bouquets, setBouquets] = useState<Bouquet[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>(
    'loading'
  );
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const load = async () => {
    setStatus('loading');
    try {
      const data = await getBouquets();
      setBouquets(data.filter((b) => b.isEnabled !== false));
      setStatus('ready');
    } catch (error) {
      console.error('shop.getBouquets failed', {
        operation: 'getBouquets',
        error,
      });
      setStatus('error');
    }
  };

  useEffect(() => {
    // Fetching from Firestore on mount; not derivable from render-time state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(bouquets.map((b) => b.category))).filter(Boolean),
    [bouquets]
  );

  const filtered = bouquets.filter((b) => {
    const categoryMatch = category === 'all' || b.category === category;
    const priceMatch = (PRICE_FILTERS[priceRange] ?? PRICE_FILTERS.all)(
      b.price
    );
    return categoryMatch && priceMatch;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-accent-foreground">
            Our Collection
          </h1>
          <p className="mt-2 text-muted-foreground">
            Browse our curated selection of snack bouquets, each one crafted
            with care and creativity.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Price</SelectItem>
              <SelectItem value="under-2000">Under 2000 PKR</SelectItem>
              <SelectItem value="2000-4000">2000-4000 PKR</SelectItem>
              <SelectItem value="over-4000">Over 4000 PKR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {status === 'loading' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center text-center py-24">
          <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
          <p className="text-lg font-semibold mb-2">Could not load products</p>
          <p className="text-muted-foreground mb-6">Please try again.</p>
          <Button onClick={load}>Retry</Button>
        </div>
      )}

      {status === 'ready' && filtered.length === 0 && (
        <div className="flex flex-col items-center text-center py-24">
          <PackageSearch className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold">
            No bouquets match your filters
          </p>
        </div>
      )}

      {status === 'ready' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((bouquet) => (
            <BouquetCard key={bouquet.id} bouquet={bouquet} />
          ))}
        </div>
      )}
    </div>
  );
}
