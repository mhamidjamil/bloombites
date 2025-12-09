'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
    const { login } = useAuth();
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    
    // In a real app, you would handle form state and submission properly.
    // For this mock, we just log in as a specific role.

    const handleLogin = (role: 'customer' | 'admin') => {
        setIsSubmitting(true);
        // Simulate network delay
        setTimeout(() => {
            login(role);
        }, 1000);
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh] bg-background">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
                    <CardDescription>Sign in to your BloomBites account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full" onClick={() => handleLogin('customer')} disabled={isSubmitting}>
                        {isSubmitting ? "Signing In..." : "Sign in as Customer"}
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={() => handleLogin('admin')} disabled={isSubmitting}>
                        {isSubmitting ? "Signing In..." : "Sign in as Admin"}
                    </Button>
                     <p className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="font-semibold text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
