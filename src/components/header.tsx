'use client';

import Link from 'next/link';
import {
  ShoppingCart,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ListOrdered,
  Menu,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from './ui/button';
import Logo from './logo';
import { useAuth } from '@/lib/auth-context';
import useCartStore from '@/lib/cart-store';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useSyncExternalStore } from 'react';
import { ThemeToggle } from './theme-toggle';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const subscribeNoop = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
}

const Header = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCartStore();
  const isClient = useIsClient();
  const { setTheme, theme } = useTheme();

  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/build', label: 'Build Your Own' },
  ];

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Account';

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/cart" className="relative">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                    <UserIcon className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {displayName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="cursor-pointer">
                    <ListOrdered className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  <span>Toggle Theme</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : isClient ? (
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button asChild variant="default" size="sm">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          ) : (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          )}

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
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                    {user && (
                      <SheetClose asChild>
                        <Link
                          href="/orders"
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          My Orders
                        </Link>
                      </SheetClose>
                    )}
                    {user && user.role === 'admin' && (
                      <SheetClose asChild>
                        <Link
                          href="/admin"
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          Admin
                        </Link>
                      </SheetClose>
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
