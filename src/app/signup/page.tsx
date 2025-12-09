'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
    const { signup } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await signup(email, password);
            router.push('/');
        } catch (error: any) {
            console.error(error);
             toast({
                variant: 'destructive',
                title: 'Signup Failed',
                description: error.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh] bg-background">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
                    <CardDescription>Join BloomBites to start creating and ordering</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" type="text" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                           {isSubmitting ? "Creating Account..." : "Create Account"}
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold text-primary hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
