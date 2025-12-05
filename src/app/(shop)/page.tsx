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
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { SiteLoader } from '@/components/ui/site-loader';

export default function Home() {
  const [content, setContent] = useState<LandingPageData | null>(null);
  const [products, setProducts] = useState<Bouquet[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let isMounted = true;

    // Safety timeout
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Home page data fetch timed out.');
        setDataLoaded(true); // Allow site to show even if data fails
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
          clearTimeout(timeoutId);
          setDataLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load home data', error);
        if (isMounted) setDataLoaded(true);
      }
    }
    fetchData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

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
  useEffect(() => {
    if (displayHeroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayHeroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [displayHeroImages.length]);

  // Fallbacks
  const heroTitle =
    content?.hero?.title || 'Edible Art, Deliciously Delivered.';
  const heroSubtitle =
    content?.hero?.subtitle ||
    'Surprise your loved ones with our handcrafted snack bouquets. The perfect blend of elegance and flavor for every occasion.';

  const featured = products.filter((p) => p.isFeatured);
  const displayFeatured =
    featured.length > 0 ? featured : products.length === 0 ? mockFeatured : [];

  return (
    <div className="flex flex-col min-h-screen bg-black"> {/* Set bg-black to hide flashing white before loader leaves */}
      
      {/* 1. Full Screen Loader */}
      <SiteLoader isLoading={!dataLoaded} />

      {/* Hero Section */}
      <section className="relative h-[95vh] w-full overflow-hidden bg-black font-sans"> {/* Increased height for impact */}
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
                className="object-cover scale-105 animate-slow-zoom" // Added subtle zoom animation via class if exists, but standard object-cover is fine
                priority={idx === 0}
                unoptimized={url.startsWith('http')}
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/70 to-transparent" />

        <div className="relative z-30 container mx-auto h-full flex flex-col justify-center px-4 md:px-6">
          <div className="max-w-4xl">
            <ScrollReveal animation="3d-flip" duration={1} delay={0.5}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-headline text-white drop-shadow-2xl leading-[1.1] tracking-tight">
                {heroTitle.split(',')[0]}, <br />
                <span className="text-primary italic">
                  {heroTitle.split(',')[1] || 'Deliciously Delivered.'}
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={0.8} duration={0.8}>
              <p className="mt-8 text-xl md:text-2xl text-gray-200 shadow-sm max-w-2xl leading-relaxed font-light">
                {heroSubtitle}
              </p>
            </ScrollReveal>
            
            <ScrollReveal animation="fade-up" delay={1.0} duration={0.8}>
              <div className="mt-12 flex flex-col sm:flex-row gap-6">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xl px-10 py-7 rounded-full shadow-xl transition-all hover:scale-105 hover:shadow-primary/25"
                >
                  <Link href="/shop">Shop Collection</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-white border-white/30 hover:bg-white hover:text-black hover:border-white text-xl px-10 py-7 rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-105"
                >
                  <Link href="/build">Build Your Own</Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
          
          {/* Scroll Down Indicator */}
           <ScrollReveal animation="fade-in" delay={1.5} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-widest">Scroll</span>
              <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
           </ScrollReveal>

          {/* Slide Indicators */}
          {displayHeroImages.length > 1 && (
            <div className="absolute bottom-10 right-10 flex gap-2 z-30">
              {displayHeroImages.map((_, idx) => (
                <button
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === idx ? 'w-8 bg-primary' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal animation="fade-up" className="mb-20 text-center">
             <span className="text-primary text-sm font-bold uppercase tracking-widest mb-4 block">Why Choose BloomBites?</span>
             <h2 className="text-4xl md:text-5xl font-headline font-bold">The Art of Gifting</h2>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Palette, title: 'Fully Customizable', desc: 'Create a unique gift by handpicking snacks, chocolates, and decorations to match their taste perfectly.' },
              { icon: Truck, title: 'Fast Delivery', desc: 'We ensure your fresh and beautiful bouquet arrives on time to make their day special.' },
              { icon: Heart, title: 'Made with Love', desc: 'Each arrangement is handcrafted by our skilled artisans with attention to detail and care.' }
            ].map((item, idx) => (
              <ScrollReveal key={idx} animation="fade-up" delay={idx * 0.2} duration={0.8}>
                <div className="group flex flex-col items-center text-center p-8 rounded-3xl bg-card/50 border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 hover:-translate-y-2">
                  <div className="h-20 w-20 bg-primary/10 rounded-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500 flex items-center justify-center mb-8 text-primary">
                    <item.icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold font-headline mb-4 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {item.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Bouquets - 3D Carousel Style Showcase */}
      <section className="py-32 bg-white dark:bg-muted/30">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-up" className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-headline font-bold text-foreground mb-6">
              Featured Collections
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
              Our most popular arrangements, curated to bring joy and delight.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {displayFeatured.map((bouquet, idx) => (
              <ScrollReveal key={bouquet.id} animation="3d-flip" delay={idx * 0.15} duration={0.8}>
                <div className="h-full">
                    <BouquetCard bouquet={bouquet} />
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal animation="fade-up" delay={0.4} className="text-center mt-20">
            <Button
              asChild
              variant="default"
              size="lg"
              className="rounded-full px-10 py-6 text-lg shadow-xl hover:scale-105 transition-transform"
            >
              <Link href="/shop" className="group">
                View All Collections
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* Custom Bouquet Builder Promo */}
      {(content?.featured?.showPromo ?? true) && (
        <section className="py-32 bg-background overflow-hidden">
          <div className="container mx-auto px-4">
            <ScrollReveal animation="zoom-in" duration={0.8} threshold={0.4}>
              <div className="relative rounded-[2.5rem] overflow-hidden bg-primary/5 border border-primary/10 shadow-2xl">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="p-10 md:p-16 lg:p-24 flex flex-col justify-center order-2 lg:order-1 relative z-10">
                    <ScrollReveal animation="slide-in-left" delay={0.2}>
                      <div className="inline-block px-4 py-2 rounded-full bg-white shadow-sm text-primary text-sm font-bold tracking-wider mb-8 w-fit border border-primary/20">
                        BE CREATIVE
                      </div>
                      <h2 className="text-4xl md:text-6xl font-headline font-bold mb-8 text-foreground leading-none">
                        Your Vision, <br />
                        Our Craft.
                      </h2>
                      <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg">
                        Design a truly personal gift with our Custom Bouquet
                        Builder. Choose from hundreds of premium snacks, chocolates,
                        and unique add-ons.
                      </p>
                      <div>
                        <Button
                          asChild
                          size="lg"
                          className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-10 py-7 text-lg shadow-xl"
                        >
                          <Link href="/build">Start Building Now</Link>
                        </Button>
                      </div>
                    </ScrollReveal>
                  </div>
                  
                  <div className="relative h-[500px] lg:h-auto order-1 lg:order-2 overflow-hidden">
                   <ScrollReveal animation="zoom-in" delay={0.3} className="w-full h-full"> 
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
                      className="object-cover transition-transform duration-[2s] hover:scale-110"
                      unoptimized={!!content?.featured?.promoImageUrl}
                    />
                    </ScrollReveal>
                    <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-black/10 to-transparent" />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <ScrollReveal animation="fade-up" className="text-center mb-20">
             <h2 className="text-3xl md:text-5xl font-headline font-bold">Loved by our customers</h2>
          </ScrollReveal>

          <div className="max-w-6xl mx-auto">
            <Carousel
              opts={{
                align: 'center',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {testimonials.map((testimonial, idx) => (
                  <CarouselItem
                    key={testimonial.id}
                    className="md:basis-1/2 lg:basis-1/3 pl-4"
                  >
                    <ScrollReveal animation="fade-up" delay={idx * 0.1}>
                      <div className="h-full p-10 rounded-3xl bg-card border shadow-sm flex flex-col hover:shadow-xl transition-shadow duration-300">
                        <Quote className="h-10 w-10 text-primary/20 mb-6" />
                        <p className="text-lg text-foreground/80 italic mb-8 flex-grow leading-relaxed">
                          "{testimonial.quote}"
                        </p>
                        <div className="flex items-center mt-auto border-t pt-6 border-border/50">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg mr-4 border border-primary/20">
                            {testimonial.author.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold font-headline text-lg">
                              {testimonial.author}
                            </p>
                            <div className="flex text-primary mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-3.5 w-3.5 fill-current" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-4 mt-12">
                <CarouselPrevious className="static translate-y-0 h-12 w-12 border-primary/20 hover:bg-primary hover:text-white hover:border-primary transition-colors" />
                <CarouselNext className="static translate-y-0 h-12 w-12 border-primary/20 hover:bg-primary hover:text-white hover:border-primary transition-colors" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>
    </div>
  );
}
