import { Flower2 } from 'lucide-react';
import Link from 'next/link';

const Logo = () => {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-xl md:text-2xl font-bold text-foreground font-headline"
    >
      <Flower2 className="h-6 w-6 text-primary" />
      <span>BloomBites</span>
    </Link>
  );
};

export default Logo;
