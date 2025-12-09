import CustomBouquetBuilder from '@/components/custom-bouquet-builder';

export default function BuildPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-accent-foreground">
          Custom Bouquet Builder
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Design your own unique snack bouquet from scratch. Pick your favorite items and we'll craft it for you!
        </p>
      </div>
      <CustomBouquetBuilder />
    </div>
  );
}
