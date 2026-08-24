'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { getOrdersByUser } from '@/lib/db-service';
import type { Order, OrderStatus } from '@/lib/types';
import { AlertTriangle, Loader2, PackageSearch } from 'lucide-react';

const statusVariant = (status: OrderStatus) => {
  switch (status) {
    case 'Completed':
      return 'default' as const;
    case 'Processing':
      return 'secondary' as const;
    case 'Cancelled':
      return 'destructive' as const;
    default:
      return 'outline' as const;
  }
};

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>(
    'loading'
  );

  const load = async (uid: string) => {
    setStatus('loading');
    try {
      const result = await getOrdersByUser(uid);
      setOrders(result);
      setStatus('ready');
    } catch (error) {
      console.error('my-orders.getOrdersByUser failed', {
        operation: 'getOrdersByUser',
        uid,
        error,
      });
      setStatus('error');
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      load(user.uid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.uid]);

  if (authLoading || (user && status === 'loading')) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
        <p className="text-lg font-semibold mb-2">Sign in to see your orders</p>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
        <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
        <p className="text-lg font-semibold mb-2">
          Could not load your orders
        </p>
        <Button onClick={() => load(user.uid)}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">
          My Orders
        </h1>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <PackageSearch className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold">No orders yet</h2>
            <p className="text-muted-foreground mt-2">
              Your placed orders will show up here.
            </p>
            <Button asChild className="mt-6">
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-bold">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.orderDate).toLocaleDateString()} •{' '}
                    {order.items.length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={statusVariant(order.status)}>
                    {order.status}
                  </Badge>
                  <span className="font-bold">
                    PKR {order.totalAmount.toLocaleString()}
                  </span>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/order-confirmation/${order.id}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
