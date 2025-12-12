'use client';

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Logo from '../logo';
import {
  LayoutDashboard,
  Package,
  ShoppingBasket,
  Users,
  LogOut,
  Settings,
  Tags,
  Palette,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bouquets', label: 'Bouquets', icon: Package },
  { href: '/admin/items', label: 'Items', icon: ShoppingBasket },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/styles', label: 'Styles', icon: Palette },
  { href: '/admin/orders', label: 'Orders', icon: Users },
];

export default function AdminNav() {
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} className="w-full">
                <SidebarMenuButton isActive={pathname === item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
