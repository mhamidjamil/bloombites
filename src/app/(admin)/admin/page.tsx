import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bouquets, customItems, orders } from "@/lib/mock-data";
import { Package, ShoppingBasket, Users } from "lucide-react";

export default function AdminDashboardPage() {
    const stats = [
        {
            title: "Total Bouquets",
            count: bouquets.length,
            icon: Package,
        },
        {
            title: "Total Items",
            count: customItems.length,
            icon: ShoppingBasket,
        },
        {
            title: "Pending Orders",
            count: orders.filter(o => o.status === 'processing').length,
            icon: Users,
        }
    ]

    return (
        <div>
            <h1 className="text-3xl font-bold font-headline mb-8">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map(stat => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.count}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold font-headline mb-4">Recent Activity</h2>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-muted-foreground">Recent orders and updates will be shown here.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
