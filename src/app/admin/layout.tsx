

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
  User,
  PackagePlus,
  Warehouse,
  Store,
  Wrench
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Logo />
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
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between p-4 border-b bg-card gap-2">
            <div className="flex items-center gap-2 md:gap-6 text-sm font-medium">
                <SidebarToggle />
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
        </header>
        <main className="p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function UserMenu() {
  return (
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 rounded-full p-0 flex items-center gap-2 w-full justify-start">
                  <Avatar className="h-10 w-10">
                      <AvatarImage src="https://picsum.photos/seed/admin/100/100" data-ai-hint="person portrait" alt="@admin" />
                      <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <span className="truncate">Hi, Admin!</span>
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Admin User</p>
                      <p className="text-xs leading-none text-muted-foreground">
                          admin@karma.com
                      </p>
                  </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><User className="mr-2" /> Profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                  <Link href="/"><LogOut className="mr-2" /> Log out</Link>
              </DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>
  );
}
