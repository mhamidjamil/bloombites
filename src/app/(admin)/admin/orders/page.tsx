import { Card, CardContent } from "@/components/ui/card";
import { orders } from "@/lib/mock-data";
import { Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  

export default function AdminOrdersPage() {

    const getStatusVariant = (status: 'processing' | 'completed' | 'cancelled') => {
        switch(status) {
            case 'completed': return 'default';
            case 'processing': return 'secondary';
            case 'cancelled': return 'destructive';
        }
    }
  return (
    <div>
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold font-headline">Manage Orders</h1>
        </div>
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total (PKR)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>{order.customerDetails.name}</TableCell>
                                <TableCell>{order.orderDate.toLocaleDateString()}</TableCell>
                                <TableCell>{order.totalAmount.toLocaleString()}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(order.status)}>
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm">Update Status</Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>Processing</DropdownMenuItem>
                                            <DropdownMenuItem>Completed</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Cancelled</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <Button variant="ghost" size="icon" className="ml-2">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
