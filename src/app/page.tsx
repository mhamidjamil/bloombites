import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { featuredBouquets, testimonials } from '@/lib/mock-data';
import { placeholderImages } from '@/lib/placeholder-images';
import { ArrowRight, Star, Truck, Heart, Palette, Quote } from 'lucide-react';
import BouquetCard from '@/components/bouquet-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function Home() {
  const heroImage = placeholderImages.find((p) => p.id === 'hero-bouquet');
  const customBuilderImage = placeholderImages.find(
    (p) => p.id === 'custom-builder-promo'
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

        <div className="relative z-10 container mx-auto h-full flex flex-col justify-center px-4 md:px-6">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-headline text-white drop-shadow-xl leading-tight">
              Edible Art, <br />
              <span className="text-primary">Deliciously Delivered.</span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-gray-200 shadow-sm max-w-2xl leading-relaxed">
              Surprise your loved ones with our handcrafted snack bouquets. The
              perfect blend of elegance and flavor for every occasion.
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
            {featuredBouquets.map((bouquet) => (
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
                  Design a truly personal gift with our Custom Bouquet Builder.
                  Choose from hundreds of premium snacks, chocolates, and unique
                  add-ons. Whether it's for a birthday, anniversary, or just
                  because - make it unique.
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
                  src={customBuilderImage?.imageUrl || '/placeholder.jpg'}
                  alt="Custom bouquet builder"
                  fill
                  className="object-cover"
                  data-ai-hint={customBuilderImage?.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

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
