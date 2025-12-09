import Image from 'next/image';
import Link from 'next/link';
import type { Bouquet } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { placeholderImages } from '@/lib/placeholder-images';
import { Eye, ShoppingCart } from 'lucide-react';

type BouquetCardProps = {
  bouquet: Bouquet;
};

const BouquetCard = ({ bouquet }: BouquetCardProps) => {
  const image = placeholderImages.find(p => p.id === bouquet.images[0]);

  return (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <Link href={`/shop/${bouquet.slug}`} className="block aspect-square relative">
          {image && (
            <Image
              src={image.imageUrl}
              alt={bouquet.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={image.imageHint}
            />
          )}
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-headline">
          <Link href={`/shop/${bouquet.slug}`} className="hover:text-primary transition-colors">
            {bouquet.name}
          </Link>
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {bouquet.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <span className="text-2xl font-bold font-headline text-accent">PKR {bouquet.price.toLocaleString()}</span>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="icon">
            <Link href={`/shop/${bouquet.slug}`}><Eye className="h-4 w-4" /><span className="sr-only">View Details</span></Link>
          </Button>
          {/* Add to cart functionality would be here */}
          <Button size="icon">
            <ShoppingCart className="h-4 w-4" /><span className="sr-only">Add to Cart</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BouquetCard;
