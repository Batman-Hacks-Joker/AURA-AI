import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-background to-violet-100 dark:to-violet-900/20 pt-16">
      <div className="max-w-4xl w-full text-center space-y-8">
        
        <div className="text-center">
          <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter text-foreground">
            Your Integrated Commerce Ecosystem
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Step into KARMA. Whether you're managing your business or your products, we provide a seamless, AI-powered experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 pt-8">
          <RoleCard
            href="/login?role=admin"
            title="I'm an Admin"
            description="Manage your stores, warehouses, and service centers with powerful, AI-driven tools."
          />
          <RoleCard
            href="/login?role=customer"
            title="I'm a Customer"
            description="Access your product dashboard, explore marketplaces, and get instant support."
          />
        </div>
      </div>
      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} KARMA. All Rights Reserved.
      </footer>
    </main>
  );
}

function RoleCard({ href, title, description }: { href: string; title: string; description: string; }) {
  return (
    <Link href={href} className="group block">
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
    </Link>
  );
}
