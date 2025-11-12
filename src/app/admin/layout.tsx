
'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
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
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "./user-menu";
import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/firebase/auth/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function AdminSidebarInner() {
  const { toggleSidebar, state } = useSidebar();
  const { user, userProfile } = useAuth();
  const isCollapsed = state === 'collapsed';

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const isRailClick = (e.target as HTMLElement).closest('[data-sidebar="rail"]');
    if (!isRailClick || !isCollapsed) {
      if ((e.target as HTMLElement).closest('[data-sidebar="menu-button"]')) {
        return
      }
      toggleSidebar();
    }
  };
  
  const displayName = userProfile ? userProfile.displayName.split(' ')[0] : 'Admin';
  
  const getInitials = (name: string) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <Sidebar collapsible="icon" onClick={handleClick}>
      <SidebarHeader className="flex items-center justify-between">
        <Link href="/">
          <Logo collapsed={isCollapsed} />
        </Link>
        <SidebarToggle />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="group/menu-item relative flex items-center gap-2">
                {isCollapsed ? (
                    <UserMenu />
                ) : userProfile && (
                    <>
                        <Avatar className="h-10 w-10">
                          {user?.photoURL && <AvatarImage src={user.photoURL} alt={userProfile.displayName} />}
                          <AvatarFallback>{getInitials(userProfile.displayName)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                          Hi, {displayName}!
                        </span>
                    </>
                )}
            </div>
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
              <ThemeToggle withinSidebar />
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
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isDashboard = pathname === '/admin/dashboard';

    return (
      <>
        <AdminSidebarInner />
        <SidebarInset className="flex flex-col max-h-screen">
          {!isDashboard && (
            <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-card gap-4 px-4 shrink-0">
                <div className="flex-1 flex items-center justify-center gap-2 md:gap-6 text-sm font-medium">
                    <Link href="/admin/dashboard" className="relative group flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="hidden md:inline">Dashboard</span>
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                    </Link>
                    <Link href="/admin/product-creation" className="relative group flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                        <PackagePlus className="h-5 w-5" />
                        <span className="hidden md:inline">Item Creation</span>
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                    </Link>
                    <Link href="/admin/inventory" className="relative group flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                        <Warehouse className="h-5 w-5" />
                        <span className="hidden md:inline">Inventory</span>
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                    </Link>
                    <Link href="/marketplace" className="relative group flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                        <Store className="h-5 w-5" />
                        <span className="hidden md:inline">Marketplace</span>
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                    </Link>
                    <Link href="/admin/service-center" className="relative group flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                        <Wrench className="h-5 w-5" />
                        <span className="hidden md:inline">Service Center</span>
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                    </Link>
                </div>
            </header>
          )}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
            {children}
          </main>
        </SidebarInset>
      </>
    );
}
