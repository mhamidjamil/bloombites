import type { Metadata } from 'next';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the BloomBites team.',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold font-headline text-foreground md:text-5xl">
          Get in Touch
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Questions about an order or a custom bouquet? We&apos;d love to hear
          from you.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <Mail className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-lg">Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              hello@bloombites.example
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Placeholder, update to the real support inbox before launch.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <MessageCircle className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-lg">WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Not connected yet</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Add a real WhatsApp business number here before launch.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Phone className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-lg">Phone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Not connected yet</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Add a real support number here before launch.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
