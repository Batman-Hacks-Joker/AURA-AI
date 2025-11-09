'use client';
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

type LoggedInUser = {
  email: string;
  role: 'admin' | 'customer';
};

export function Hero() {
  const speakerImage = PlaceHolderImages.find(p => p.id === 'product-1');
  const [user, setUser] = useState<LoggedInUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    setUser(storedUser ? JSON.parse(storedUser) : null);

    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('loggedInUser');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const getStartedLink = user ? `/${user.role}/dashboard` : "/signup";
  const getStartedText = user ? "Go to Dashboard" : "Get Started";


  return (
    <section className="bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter font-headline">
              The Future of Smart Living is Here.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-prose">
              Experience the seamless integration of your favorite devices with AURA AI. Effortless control, intelligent automation, and a personalized ecosystem designed for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                <Link href={getStartedLink}>{getStartedText}</Link>
              </Button>
              {!user && (
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </div>
          </div>
          <div>
            {speakerImage && (
              <Image
                src={speakerImage.imageUrl}
                alt={speakerImage.description}
                width={600}
                height={600}
                data-ai-hint={speakerImage.imageHint}
                className="rounded-lg shadow-2xl aspect-square object-cover"
                priority
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
