import { Facebook, Instagram, Twitter } from 'lucide-react';
import Logo from './logo';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-accent text-accent-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-accent-foreground/80">
              The perfect gift for any occasion. Handcrafted snack bouquets, delivered with love right to your doorstep.
            </p>
          </div>
          <div>
            <h3 className="font-bold font-headline text-lg text-primary">Explore</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/shop" className="hover:text-primary transition-colors">Shop All</Link></li>
              <li><Link href="/build" className="hover:text-primary transition-colors">Build a Bouquet</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold font-headline text-lg text-primary">Follow Us</h3>
            <div className="mt-4 flex space-x-4">
              <Link href="#" aria-label="Facebook" className="hover:text-primary transition-colors"><Facebook /></Link>
              <Link href="#" aria-label="Instagram" className="hover:text-primary transition-colors"><Instagram /></Link>
              <Link href="#" aria-label="Twitter" className="hover:text-primary transition-colors"><Twitter /></Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-accent-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-accent-foreground/60">
          <p>&copy; {new Date().getFullYear()} BloomBites. All rights reserved.</p>
          <p className="mt-4 md:mt-0">Crafted with ❤️ in Pakistan</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
