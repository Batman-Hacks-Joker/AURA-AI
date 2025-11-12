'use client';

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import Link from 'next/link';
import { Shield, User } from "lucide-react";

export default function RoleSelectionPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Link href="/">
            <Logo />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Choose Your Role</h1>
            <p className="text-sm text-muted-foreground">How are you signing in today?</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <Link href="/login/admin">
            <Card className="hover:bg-accent hover:text-accent-foreground transition-colors">
              <CardHeader className="flex flex-row items-center gap-4">
                <Shield className="h-10 w-10 text-primary" />
                <div>
                  <CardTitle>Login as Admin</CardTitle>
                  <CardDescription>Access the management dashboard.</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/login/customer">
            <Card className="hover:bg-accent hover:text-accent-foreground transition-colors">
              <CardHeader className="flex flex-row items-center gap-4">
                <User className="h-10 w-10 text-primary" />
                <div>
                  <CardTitle>Login as Customer</CardTitle>
                  <CardDescription>Access your products and support.</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
}
