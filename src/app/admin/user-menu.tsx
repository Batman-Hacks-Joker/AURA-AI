'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { User, LayoutDashboard, LogOut } from 'lucide-react';


export function UserMenu() {
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
    
    // This is a placeholder user. In a real app, you'd get this from context or a hook.
    const user = { email: 'admin@karma.com', role: 'admin' };
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
