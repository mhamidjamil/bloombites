'use client';

import Link from 'next/link';
import { ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, Menu } from 'lucide-react';
import { Button } from './ui/button';
import Logo from './logo';
import { useAuth } from '@/lib/auth-context';
import useCartStore from '@/lib/cart-store';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState, useEffect } from 'react';

const Header = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCartStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/build', label: 'Build Your Own' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {isClient && totalItems > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>
          {isClient && user ? (
            <>
              {user.role === 'admin' && (
                <Button asChild variant="ghost" size="icon" className="hidden md:inline-flex">
                  <Link href="/admin">
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="sr-only">Admin Dashboard</span>
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Log Out</span>
              </Button>
            </>
          ) : isClient ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">
                <UserIcon className="h-5 w-5 mr-2" /> Login
              </Link>
            </Button>
          ) : <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />}

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 py-6">
                    <Logo />
                    <nav className="flex flex-col gap-4 text-lg font-medium">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                        {link.label}
                        </Link>
                    ))}
                     {user && user.role === 'admin' && (
                        <Link href="/admin" className="text-muted-foreground transition-colors hover:text-foreground">Admin</Link>
                     )}
                    </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
