'use client';

import useCartStore from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { items, totalPrice, totalItems, updateQuantity, removeItem } = useCartStore();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-accent-foreground">
          Your Shopping Cart
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Review your items and proceed to checkout.
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold">Your cart is empty</h2>
            <p className="text-muted-foreground mt-2">
              Looks like you haven't added any bouquets yet.
            </p>
            <Button asChild className="mt-6">
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const imageId = 'product' in item.product && item.product.id !== 'custom-bouquet' ? item.product.images[0] : 'custom-builder-promo';
              const image = placeholderImages.find(p => p.id === imageId);
              
              return (
              <Card key={item.id} className="flex items-center p-4">
                <div className="relative h-24 w-24 rounded-md overflow-hidden mr-4">
                  {image && <Image src={image.imageUrl} alt={item.product.name} fill className="object-cover" />}
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-lg">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground">PKR {item.product.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 border rounded-md p-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            )})}
          </div>
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold font-headline mb-4">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>PKR {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>PKR 250</span>
                  </div>
                </div>
                <div className="border-t my-4 pt-4 flex justify-between items-center text-xl font-bold">
                  <span>Total</span>
                  <span>PKR {(totalPrice + 250).toLocaleString()}</span>
                </div>
                <Button asChild size="lg" className="w-full mt-4">
                    <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
