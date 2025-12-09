'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useCartStore from '@/lib/cart-store';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCartStore();
  const router = useRouter();

  if (totalItems === 0) {
    if (typeof window !== 'undefined') {
        router.push('/shop');
    }
    return null; // or a loading spinner
  }
  
  const handlePlaceOrder = () => {
    // In a real app, this would submit the order to the backend
    console.log("Placing order...");
    clearCart();
    // Show a success message/toast
    router.push('/order-confirmation'); // Redirect to a confirmation page
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-accent-foreground">
          Checkout
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Almost there! Please provide your details to complete the order.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold font-headline mb-6">Shipping Information</h2>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john.doe@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="0300-1234567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" placeholder="House 123, Street 45" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="Karachi" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="province">Province</Label>
                        <Input id="province" placeholder="Sindh" />
                    </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold font-headline mb-4">Order Summary</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="truncate pr-2">{item.product.name} x{item.quantity}</span>
                    <span>PKR {(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
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
              <div className="bg-primary/10 p-3 rounded-md text-center text-sm text-primary-foreground">
                Payment Method: Cash on Delivery
              </div>
              <Button size="lg" className="w-full mt-4" onClick={handlePlaceOrder}>
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
