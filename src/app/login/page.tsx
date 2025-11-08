'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Mail, KeyRound } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const TEST_USERS = {
  admin: { email: 'admintest@email.com', pass: 'admin' },
  customer: { email: 'ctest@email.com', pass: 'ctest' },
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const role = searchParams.get('role') || 'customer';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userRole = role as keyof typeof TEST_USERS;
    const testUser = TEST_USERS[userRole];

    if (email === testUser.email && password === testUser.pass) {
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/customer/dashboard');
      }
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Credentials",
        description: "Please check your email and password and try again.",
      });
    }
  };

  const title = role === 'admin' ? 'Admin Portal' : 'Customer Hub';
  const description = `Sign in to access the ${title.toLowerCase()}.`;

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="name@example.com" required className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" required placeholder="••••••••" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Sign In</Button>
              <p className="text-xs text-muted-foreground text-center">
                Don't have an account? <Link href="/login?role=customer" className="text-primary hover:underline font-semibold">Sign up</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
