import { notFound } from 'next/navigation';
import Image from 'next/image';
import { bouquets } from '@/lib/mock-data';
import { placeholderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Minus, Plus, ShoppingCart } from 'lucide-react';
import BouquetCard from '@/components/bouquet-card';

export async function generateStaticParams() {
  return bouquets.map((bouquet) => ({
    slug: bouquet.slug,
  }));
}

export default function BouquetDetailsPage({ params }: { params: { slug: string } }) {
  const bouquet = bouquets.find((b) => b.slug === params.slug);

  if (!bouquet) {
    notFound();
  }

  const relatedBouquets = bouquets.filter(b => b.category === bouquet.category && b.id !== bouquet.id).slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square relative mb-4 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={placeholderImages.find(p => p.id === bouquet.images[0])?.imageUrl || ''}
              alt={bouquet.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {bouquet.images.map((imgId, index) => {
              const img = placeholderImages.find(p => p.id === imgId);
              return (
                <div key={index} className="aspect-square relative rounded-md overflow-hidden border-2 border-primary">
                  {img && <Image src={img.imageUrl} alt={`${bouquet.name} - view ${index + 1}`} fill className="object-cover" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bouquet Info */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline text-accent-foreground">{bouquet.name}</h1>
          <p className="text-3xl font-bold font-headline text-primary mt-2">PKR {bouquet.price.toLocaleString()}</p>
          <p className="mt-4 text-muted-foreground">{bouquet.description}</p>
          
          <Separator className="my-6" />

          <h2 className="text-xl font-bold font-headline text-accent-foreground">What's Inside?</h2>
          <ul className="mt-4 space-y-2">
            {bouquet.items.map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>

          <Separator className="my-6" />
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 border rounded-md p-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="font-bold text-lg w-8 text-center">1</span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <Button size="lg" className="flex-grow">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
      
      {/* Related Bouquets */}
      <div className="mt-24">
        <h2 className="text-3xl font-bold font-headline text-center text-accent-foreground">You Might Also Like</h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedBouquets.map(related => (
            <BouquetCard key={related.id} bouquet={related} />
          ))}
        </div>
      </div>
    </div>
  );
}
