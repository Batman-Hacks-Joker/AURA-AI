
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import {
  Home,
  Star,
  LogOut,
  PackagePlus,
  Warehouse,
  Store,
  Wrench,
  ArrowLeftToLine,
  ArrowRightToLine,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { User, LayoutDashboard } from 'lucide-react';


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="flex items-center justify-between">
          <Logo />
          <SidebarToggle />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Button variant="ghost" className="relative h-10 rounded-full p-0 flex items-center gap-2 w-full justify-start">
                  <Avatar className="h-10 w-10">
                      <AvatarImage src="https://picsum.photos/seed/admin/100/100" data-ai-hint="person portrait" alt="@admin" />
                      <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <span className="truncate">Hi, Admin!</span>
              </Button>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Home" className="text-base">
                <Link href="/">
                  <Home />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Features" className="text-base">
                <Link href="#">
                  <Star />
                  <span>Features</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <ThemeToggle />
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Logout" className="text-base">
                    <Link href="/">
                        <LogOut />
                        <span>Log out</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between p-4 border-b bg-card gap-4">
            <div className="flex items-center gap-4">
              <Logo />
            </div>
            <div className="flex-1 flex items-center justify-center gap-2 md:gap-6 text-sm font-medium">
                <Link href="/admin/product-creation" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    <PackagePlus className="h-5 w-5" />
                    <span className="hidden md:inline">Product Creation</span>
                </Link>
                <Link href="/admin/inventory" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    <Warehouse className="h-5 w-5" />
                    <span className="hidden md:inline">Inventory</span>
                </Link>
                <Link href="/marketplace" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    <Store className="h-5 w-5" />
                    <span className="hidden md:inline">Marketplace</span>
                </Link>
                <Link href="/admin/service-center" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                    <Wrench className="h-5 w-5" />
                    <span className="hidden md:inline">Service Center</span>
                </Link>
            </div>
            <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserMenu />
            </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}


function UserMenu() {
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
