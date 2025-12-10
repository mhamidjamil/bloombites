'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { testimonials } from '@/lib/mock-data';
import {
  ArrowRight,
  Star,
  Truck,
  Heart,
  Palette,
  Quote,
  Loader2,
} from 'lucide-react';
import BouquetCard from '@/components/bouquet-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  getLandingPageData,
  getBouquets,
  type LandingPageData,
} from '@/lib/db-service';
import type { Bouquet } from '@/lib/types';
import { featuredBouquets as mockFeatured } from '@/lib/mock-data';
import { placeholderImages } from '@/lib/placeholder-images';

export default function Home() {
  const [content, setContent] = useState<LandingPageData | null>(null);
  const [products, setProducts] = useState<Bouquet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Safety timeout to prevent infinite loading if DB is unreachable
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Home page data fetch timed out.');
        setIsLoading(false);
      }
    }, 5000);

    async function fetchData() {
      try {
        const [pageData, bouquetsData] = await Promise.all([
          getLandingPageData(),
          getBouquets(),
        ]);
        if (isMounted) {
          setContent(pageData);
          setProducts(bouquetsData);
          // Cancel timeout if successful load happens before it
          clearTimeout(timeoutId);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load home data', error);
        if (isMounted) setIsLoading(false);
      }
    }
    fetchData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Fallbacks
  const heroTitle =
    content?.hero?.title || 'Edible Art, Deliciously Delivered.';
  const heroSubtitle =
    content?.hero?.subtitle ||
    'Surprise your loved ones with our handcrafted snack bouquets. The perfect blend of elegance and flavor for every occasion.';

  // Resolve Hero Images
  let displayHeroImages: string[] = [];
  if (content?.hero?.imageUrls && content.hero.imageUrls.length > 0) {
    displayHeroImages = content.hero.imageUrls;
  } else if (content?.hero?.imageUrl) {
    displayHeroImages = [content.hero.imageUrl];
  } else {
    const defaultHero = placeholderImages.find((p) => p.id === 'hero-bouquet');
    displayHeroImages = [defaultHero?.imageUrl || '/placeholder.jpg'];
  }

  // Hero Slideshow Logic
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (displayHeroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayHeroImages.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(interval);
  }, [displayHeroImages.length]);

  const featured = products.filter((p) => p.isFeatured);
  const displayFeatured =
    featured.length > 0 ? featured : products.length === 0 ? mockFeatured : [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden bg-black">
        {/* Background Slideshow */}
        <div className="absolute inset-0 w-full h-full">
          {displayHeroImages.map((url, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <Image
                src={url}
                alt={`Hero image ${idx + 1}`}
                fill
                className="object-cover"
                priority={idx === 0}
                unoptimized={url.startsWith('http')}
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/60 to-transparent" />

        <div className="relative z-30 container mx-auto h-full flex flex-col justify-center px-4 md:px-6">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-headline text-white drop-shadow-xl leading-tight">
              {heroTitle.split(',')[0]}, <br />
              <span className="text-primary">
                {heroTitle.split(',')[1] || 'Deliciously Delivered.'}
              </span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-gray-200 shadow-sm max-w-2xl leading-relaxed">
              {heroSubtitle}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105"
              >
                <Link href="/shop">Shop Collection</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white/10 hover:text-white text-lg px-8 py-6 rounded-full shadow-lg backdrop-blur-sm"
              >
                <Link href="/build">Build Your Own</Link>
              </Button>
            </div>
          </div>

          {/* Slide Indicators */}
          {displayHeroImages.length > 1 && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-30">
              {displayHeroImages.map((_, idx) => (
                <button
                  key={idx}
                  className={`h-2 rounded-full transition-all ${currentSlide === idx ? 'w-8 bg-primary' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 text-primary">
                <Palette className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold font-headline mb-3">
                Fully Customizable
              </h3>
              <p className="text-muted-foreground">
                Create a unique gift by handpicking snacks, chocolates, and
                decorations to match their taste perfectly.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 text-primary">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold font-headline mb-3">
                Fast Delivery
              </h3>
              <p className="text-muted-foreground">
                We ensure your fresh and beautiful bouquet arrives on time to
                make their day special.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 text-primary">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold font-headline mb-3">
                Made with Love
              </h3>
              <p className="text-muted-foreground">
                Each arrangement is handcrafted by our skilled artisans with
                attention to detail and care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Bouquets */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-headline font-bold text-foreground mb-4">
              Featured Collections
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our most popular arrangements, curated to bring joy and delight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayFeatured.map((bouquet) => (
              <BouquetCard key={bouquet.id} bouquet={bouquet} />
            ))}
          </div>

          <div className="text-center mt-16">
            <Button
              asChild
              variant="default"
              size="lg"
              className="rounded-full px-8"
            >
              <Link href="/shop" className="group">
                View All Collections
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Custom Bouquet Builder Promo */}
      {(content?.featured?.showPromo ?? true) && (
        <section className="py-24 bg-background overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="relative rounded-3xl overflow-hidden bg-primary/5 border shadow-2xl">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center order-2 lg:order-1">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 w-fit">
                    Be Creative
                  </div>
                  <h2 className="text-3xl md:text-5xl font-headline font-bold mb-6 text-foreground">
                    Your Vision, <br />
                    Our Craft.
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    Design a truly personal gift with our Custom Bouquet
                    Builder. Choose from hundreds of premium snacks, chocolates,
                    and unique add-ons. Whether it's for a birthday,
                    anniversary, or just because - make it unique.
                  </p>
                  <div>
                    <Button
                      asChild
                      size="lg"
                      className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 py-6 text-lg"
                    >
                      <Link href="/build">Start Building Now</Link>
                    </Button>
                  </div>
                </div>
                <div className="relative h-[400px] lg:h-auto order-1 lg:order-2">
                  <Image
                    src={
                      content?.featured?.promoImageUrl ||
                      placeholderImages.find(
                        (p) => p.id === 'custom-builder-promo'
                      )?.imageUrl ||
                      '/placeholder.jpg'
                    }
                    alt="Custom bouquet builder"
                    fill
                    className="object-cover"
                    unoptimized={!!content?.featured?.promoImageUrl}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-black/20 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section with Carousel */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline text-center font-bold mb-16">
            Loved solely by our customers
          </h2>

          <div className="max-w-4xl mx-auto">
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {testimonials.map((testimonial) => (
                  <CarouselItem
                    key={testimonial.id}
                    className="md:basis-1/2 lg:basis-1/2 p-4"
                  >
                    <div className="h-full p-8 rounded-2xl bg-card border shadow-sm flex flex-col">
                      <Quote className="h-8 w-8 text-primary/40 mb-4" />
                      <p className="text-lg text-foreground italic mb-6 flex-grow">
                        "{testimonial.quote}"
                      </p>
                      <div className="flex items-center mt-auto">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mr-3">
                          {testimonial.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold font-headline">
                            {testimonial.author}
                          </p>
                          <div className="flex text-primary">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-2 mt-8">
                <CarouselPrevious className="static translate-y-0 mr-2" />
                <CarouselNext className="static translate-y-0" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>
    </div>
  );
}
