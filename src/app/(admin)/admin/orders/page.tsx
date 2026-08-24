'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Eye, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getOrders, updateOrderStatus } from '@/lib/db-service';
import type { Order, OrderStatus } from '@/lib/types';

const STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Completed', 'Cancelled'];

const getStatusVariant = (status: OrderStatus) => {
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>(
    'loading'
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await getOrders();
      setOrders(data);
      setStatus('ready');
    } catch (error) {
      console.error('admin-orders.getOrders failed', {
        operation: 'getOrders',
        error,
      });
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (order: Order, next: OrderStatus) => {
    if (order.status === next) return;
    const previous = orders;
    setUpdatingId(order.id);
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: next } : o))
    );
    try {
      await updateOrderStatus(order.id, next);
      toast({
        title: 'Order updated',
        description: `${order.orderNumber} marked ${next}.`,
      });
    } catch (error) {
      console.error('admin-orders.updateOrderStatus failed', {
        operation: 'updateOrderStatus',
        orderId: order.id,
        status: next,
        error,
      });
      setOrders(previous);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Could not update the order status. Please try again.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline">Manage Orders</h1>
      </div>

      {status === 'loading' && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center text-center py-24">
          <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
          <p className="text-lg font-semibold mb-2">Could not load orders</p>
          <p className="text-muted-foreground mb-6">Please try again.</p>
          <Button onClick={load}>Retry</Button>
        </div>
      )}

      {status === 'ready' && orders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No orders yet.
          </CardContent>
        </Card>
      )}

      {status === 'ready' && orders.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total (PKR)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>{order.customerDetails.name}</TableCell>
                    <TableCell>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{order.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={updatingId === order.id}
                          >
                            {updatingId === order.id && (
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            )}
                            Update Status
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {STATUSES.map((s) => (
                            <DropdownMenuItem
                              key={s}
                              className={s === 'Cancelled' ? 'text-destructive' : ''}
                              onClick={() => handleStatusChange(order, s)}
                            >
                              {s}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        onClick={() => setDetailOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View order details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!detailOrder}
        onOpenChange={(open) => !open && setDetailOrder(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {detailOrder && (
            <>
              <DialogHeader>
                <DialogTitle>{detailOrder.orderNumber}</DialogTitle>
                <DialogDescription>
                  Placed {new Date(detailOrder.orderDate).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-sm mb-1">Customer</p>
                  <p className="text-sm text-muted-foreground">
                    {detailOrder.customerDetails.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {detailOrder.customerDetails.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {detailOrder.customerDetails.phone}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Shipping Address</p>
                  <p className="text-sm text-muted-foreground">
                    {detailOrder.shippingAddress.street},{' '}
                    {detailOrder.shippingAddress.city},{' '}
                    {detailOrder.shippingAddress.province}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-2">Items</p>
                  <div className="space-y-2">
                    {detailOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-sm border-b last:border-0 pb-2 last:pb-0"
                      >
                        <div className="flex justify-between">
                          <span>
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
                </div>
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span>PKR {detailOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
