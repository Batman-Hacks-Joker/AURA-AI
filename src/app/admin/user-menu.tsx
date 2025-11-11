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
import { User, LayoutDashboard, LogOut } from 'lucide-react';
import Link from "next/link";
import { useAuth } from "@/firebase/auth/use-auth";

export function UserMenu() {
    const { user, userProfile, signOut } = useAuth();

    if (!user || !userProfile) {
        return null;
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('');
    };
    
    // This is a placeholder user. In a real app, you'd get this from context or a hook.
    const role = 'admin';
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              {user.photoURL && <AvatarImage src={user.photoURL} alt={userProfile.displayName} />}
              <AvatarFallback>{getInitials(userProfile.displayName)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userProfile.displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {userProfile.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/${role}/dashboard`}><LayoutDashboard className="mr-2" /> Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled><User className="mr-2" /> Profile</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
}
