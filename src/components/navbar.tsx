'use client';

import Link from 'next/link';
import { Logo } from './logo';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { LogOut, User, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';


type LoggedInUser = {
  email: string;
  role: 'admin' | 'customer';
};

export function Navbar({ className }: { className?: string }) {
  const [user, setUser] = useState<LoggedInUser | null>(null);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('loggedInUser');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    handleStorageChange(); // Check on initial load

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm", className)}>
      <div className="container mx-auto flex h-24 flex-col items-center justify-between px-4">
        <div className="flex w-full items-center justify-center pt-4 relative">
          <div className="absolute left-0">
             {/* Placeholder for sidebar trigger if needed in this layout */}
          </div>
          <Link href="/">
            <Logo />
          </Link>
          <div className="absolute right-0 flex items-center gap-2">
            <ThemeToggle />
            {!user && (
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
        <nav className="flex gap-6 items-center py-2">
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Home
          </Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Features
          </Link>
        </nav>
      </div>
    </header>
  );
}


function UserMenu({ user }: { user: LoggedInUser }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    window.dispatchEvent(new Event("storage"));
    router.push('/login');
  };

  const getInitials = (email: string) => {
    const name = email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  };
  
  const seed = user.role === 'admin' ? 'admin' : 'customer';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`https://picsum.photos/seed/${seed}/100/100`} alt={user.email} />
            <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/${user.role}/dashboard`}><LayoutDashboard className="mr-2" /> Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled><User className="mr-2" /> Profile</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
