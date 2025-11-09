'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  const handleRoleSelection = (role: 'admin' | 'customer') => {
    if (email) {
      localStorage.setItem(`${email}-role`, role);
      router.push(`/${role}/dashboard`);
    } else {
      router.push('/login');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-background to-violet-100 dark:to-violet-900/20 pt-16">
      <div className="max-w-4xl w-full text-center space-y-8">
        
        <div className="text-center">
          <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter text-foreground">
            Welcome to AURA AI!
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            You're one step away. Choose your role to get started.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 pt-8">
          <RoleCard
            onClick={() => handleRoleSelection('admin')}
            title="I'm an Admin"
            description="Manage your stores, warehouses, and service centers with powerful, AI-driven tools."
          />
          <RoleCard
            onClick={() => handleRoleSelection('customer')}
            title="I'm a Customer"
            description="Access your product dashboard, explore marketplaces, and get instant support."
          />
        </div>
      </div>
      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} AURA AI. All Rights Reserved.
      </footer>
    </main>
  );
}

function RoleCard({ onClick, title, description }: { onClick: () => void; title: string; description: string; }) {
  return (
    <button onClick={onClick} className="group block text-left">
      <Card className="h-full transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:border-primary">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-end text-sm font-semibold text-primary">
            Continue <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
