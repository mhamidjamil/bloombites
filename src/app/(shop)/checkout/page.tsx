'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import useCartStore from '@/lib/cart-store';
import { useAuth } from '@/lib/auth-context';
import { createOrder } from '@/lib/db-service';
import { SHIPPING_FEE } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const checkoutSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number')
    .regex(/^[0-9+\-\s()]+$/, 'Phone number can only contain digits, spaces, + and -'),
  address: z.string().trim().min(5, 'Enter your street address'),
  city: z.string().trim().min(2, 'Enter your city'),
  province: z.string().trim().min(2, 'Enter your province'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const totalItems = useCartStore((state) => state.totalItems);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const clearCart = useCartStore((state) => state.clearCart);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const prefilled = useRef(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      province: '',
    },
  });

  useEffect(() => {
    if (user && !prefilled.current) {
      prefilled.current = true;
      if (user.displayName) form.setValue('name', user.displayName);
      if (user.email) form.setValue('email', user.email);
    }
  }, [user, form]);

  useEffect(() => {
    if (hasHydrated && totalItems === 0) {
      router.push('/shop');
    }
  }, [hasHydrated, totalItems, router]);

  if (!hasHydrated) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your cart...</p>
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <p className="text-muted-foreground">
          Your cart is empty. Redirecting to the shop...
        </p>
      </div>
    );
  }

  const onSubmit = async (values: CheckoutFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const order = await createOrder({
        userId: user?.uid ?? null,
        items,
        customerDetails: {
          name: values.name,
          email: values.email,
          phone: values.phone,
        },
        shippingAddress: {
          street: values.address,
          city: values.city,
          province: values.province,
        },
      });
      clearCart();
      router.push(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error('checkout.createOrder failed', {
        operation: 'createOrder',
        uid: user?.uid ?? null,
        error,
      });
      const message = 'We could not place your order. Please try again.';
      setSubmitError(message);
      toast({
        variant: 'destructive',
        title: 'Order Failed',
        description: message,
      });
      setIsSubmitting(false);
    }
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

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold font-headline mb-6">
                  Shipping Information
                </h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john.doe@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="0300-1234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="House 123, Street 45"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Karachi" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Province</FormLabel>
                          <FormControl>
                            <Input placeholder="Sindh" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold font-headline mb-4">
                  Order Summary
                </h2>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate pr-2">
                        {item.product.name} x{item.quantity}
                      </span>
                      <span>
                        PKR{' '}
                        {(item.product.price * item.quantity).toLocaleString()}
                      </span>
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
                    <span>PKR {SHIPPING_FEE.toLocaleString()}</span>
                  </div>
                </div>
                <div className="border-t my-4 pt-4 flex justify-between items-center text-xl font-bold">
                  <span>Total</span>
                  <span>PKR {(totalPrice + SHIPPING_FEE).toLocaleString()}</span>
                </div>
                <div className="bg-primary/10 p-3 rounded-md text-center text-sm text-primary-foreground">
                  Payment Method: Cash on Delivery
                </div>
                {submitError && (
                  <p className="text-sm text-destructive mt-3 text-center">
                    {submitError}
                  </p>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Place Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
