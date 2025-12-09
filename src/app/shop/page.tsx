import BouquetCard from '@/components/bouquet-card';
import { bouquets } from '@/lib/mock-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ShopPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-accent-foreground">Our Collection</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Browse our curated selection of snack bouquets, each one crafted with care and creativity.
        </p>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <Select>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="chocolates">Chocolates</SelectItem>
            <SelectItem value="chips">Chips</SelectItem>
            <SelectItem value="mixed">Mixed</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full md:w-[180px]">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {bouquets.map((bouquet) => (
          <BouquetCard key={bouquet.id} bouquet={bouquet} />
        ))}
      </div>
    </div>
  );
}
