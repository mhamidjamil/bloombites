'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getOrderById } from '@/lib/db-service';
import type { Order } from '@/lib/types';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'notfound' | 'ready'>(
    'loading'
  );

  const load = async () => {
    setStatus('loading');
    // Guests cannot read orders from Firestore, so checkout leaves the order
    // it just created in sessionStorage for this page.
    try {
      const cached = sessionStorage.getItem(`bloombites:order:${params.id}`);
      if (cached) {
        setOrder(JSON.parse(cached) as Order);
        setStatus('ready');
        return;
      }
    } catch {
      // fall through to Firestore
    }
    try {
      const result = await getOrderById(params.id);
      if (!result) {
        setStatus('notfound');
        return;
      }
      setOrder(result);
      setStatus('ready');
    } catch (error) {
      console.error('order-confirmation.getOrderById failed', {
        operation: 'getOrderById',
        orderId: params.id,
        error,
      });
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your order...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
        <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
        <p className="text-lg font-semibold mb-2">Could not load your order</p>
        <p className="text-muted-foreground mb-6">Please try again.</p>
        <Button onClick={load}>Retry</Button>
      </div>
    );
  }

  if (status === 'notfound' || !order) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
        <p className="text-lg font-semibold mb-2">Order not found</p>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t find that order.
        </p>
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
      <CheckCircle2 className="h-16 w-16 text-primary mb-6" />
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">
        Order Placed!
      </h1>
      <p className="text-muted-foreground mb-8 max-w-lg">
        Thank you, {order.customerDetails.name}. Your order has been received
        and will be delivered soon.
      </p>
      <Card className="w-full max-w-md text-left">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order Number</span>
            <span className="font-bold">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-semibold">{order.status}</span>
          </div>
          <div className="border-t pt-4 space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="text-sm">
                <div className="flex justify-between">
                  <span className="truncate pr-2">
                    {item.name} x{item.quantity}
                  </span>
                  <span>
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
                {item.details && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.details}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>PKR {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>PKR {order.shippingFee.toLocaleString()}</span>
            </div>
          </div>
          <div className="border-t pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>PKR {order.totalAmount.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-4 mt-8">
        <Button asChild variant="outline">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        <Button asChild>
          <Link href="/orders">View My Orders</Link>
        </Button>
      </div>
    </div>
  );
}
