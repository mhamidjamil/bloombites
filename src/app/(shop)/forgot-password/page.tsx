'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebaseAuth } from '@/firebase';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const auth = useFirebaseAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSent(true);
    } catch (error: any) {
      console.error('forgot-password: reset email failed', {
        code: error?.code,
        email,
      });
      if (error?.code === 'auth/user-not-found') {
        // Do not reveal whether an account exists for this email.
        setIsSent(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'Could not send reset link',
          description: getAuthErrorMessage(error),
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-background">
      <Card className="w-full max-w-sm">
        {isSent ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-headline">
                Check your email
              </CardTitle>
              <CardDescription>
                If an account exists for this email, a reset link is on its
                way.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-4">
              <Button asChild className="w-full">
                <Link href="/login">Back to login</Link>
              </Button>
            </CardFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-headline">
                Reset your password
              </CardTitle>
              <CardDescription>
                Enter your email and we&apos;ll send you a reset link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Back to login
                </Link>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
