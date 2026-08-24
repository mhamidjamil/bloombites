import type { Metadata } from 'next';
import { Heart, Sparkles, Gift } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'The story behind BloomBites, handcrafted snack bouquets made in Pakistan.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold font-headline text-foreground md:text-5xl">
          Our Story
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Edible art, deliciously delivered.
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 text-muted-foreground">
        <p>
          BloomBites started with a simple idea: gifts should be as delightful
          to receive as flowers, but as satisfying to actually enjoy as your
          favorite snack. Every bouquet we make is handcrafted, wrapping
          premium chocolates, chips, and treats into an arrangement that looks
          as good as it tastes.
        </p>
        <p>
          Whether you&apos;re celebrating a birthday, saying thank you, or
          just because, our pre-made collections and custom bouquet builder
          make it easy to put together a gift with real personality, then have
          it delivered right to the doorstep.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="text-center">
          <Heart className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-4 font-headline text-lg font-bold text-foreground">
            Handcrafted
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Every bouquet is assembled by hand, arrangement by arrangement.
          </p>
        </div>
        <div className="text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-4 font-headline text-lg font-bold text-foreground">
            Made to Order
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Build your own bouquet and choose exactly what goes inside.
          </p>
        </div>
        <div className="text-center">
          <Gift className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-4 font-headline text-lg font-bold text-foreground">
            Delivered With Care
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Packed to travel well and arrive looking exactly as it should.
          </p>
        </div>
      </div>
    </div>
  );
}
