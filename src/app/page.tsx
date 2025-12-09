import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { featuredBouquets, testimonials } from '@/lib/mock-data';
import { placeholderImages } from '@/lib/placeholder-images';
import { ArrowRight, Star } from 'lucide-react';
import BouquetCard from '@/components/bouquet-card';

export default function Home() {
  const heroImage = placeholderImages.find(p => p.id === "hero-bouquet");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] w-full">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white p-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-headline drop-shadow-lg">
            Handcrafted Snack Bouquets
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl drop-shadow-md">
            The perfect gift for any occasion, delivered with love.
          </p>
          <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6 px-10">
            <Link href="/shop">Order Now</Link>
          </Button>
        </div>
      </section>

      {/* Featured Bouquets */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline text-center font-bold text-accent-foreground">
            Featured Bouquets
          </h2>
          <p className="mt-4 text-center max-w-2xl mx-auto text-muted-foreground">
            Discover our most popular and beloved snack arrangements, perfect for any celebration.
          </p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredBouquets.map((bouquet) => (
              <BouquetCard key={bouquet.id} bouquet={bouquet} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/shop">Shop All Bouquets <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Custom Bouquet Builder Section */}
      <section className="bg-card py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-accent-foreground">
                Create Your Own Masterpiece
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Unleash your creativity with our custom bouquet builder. Handpick from dozens of snacks, chocolates, and premium add-ons to design a truly unique and personal gift.
              </p>
              <Button asChild size="lg" className="mt-8">
                <Link href="/build">Build a Custom Bouquet</Link>
              </Button>
            </div>
            <div className="order-1 md:order-2">
              <Image
                src={placeholderImages.find(p => p.id === "custom-builder-promo")?.imageUrl || "/placeholder.jpg"}
                alt="Custom bouquet builder promo"
                width={600}
                height={400}
                className="rounded-lg shadow-xl object-cover w-full h-full"
                data-ai-hint={placeholderImages.find(p => p.id === "custom-builder-promo")?.imageHint}
              />
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline text-center font-bold text-accent-foreground">
            What Our Customers Say
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-card border-border shadow-lg transform hover:scale-105 transition-transform duration-300">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="flex text-primary">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">"{testimonial.quote}"</p>
                </CardContent>
                <CardFooter>
                  <p className="font-bold text-accent-foreground">{testimonial.author}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
