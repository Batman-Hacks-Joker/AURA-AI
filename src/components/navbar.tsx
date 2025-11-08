import Link from 'next/link';
import { Logo } from './logo';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export function Navbar({ className }: { className?: string }) {
  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm", className)}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Home
          </Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Features
          </Link>
        </nav>
        <Button asChild variant="outline">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </header>
  );
}
