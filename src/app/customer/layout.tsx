
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
  LayoutDashboard,
  ShoppingCart,
  LifeBuoy,
} from "lucide-react";
import Link from "next/link";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "./user-menu";
import React from "react";


function CustomerSidebarInner() {
  const { toggleSidebar, state } = useSidebar();
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

  return (
    <Sidebar collapsible="icon" onClick={handleClick}>
      <SidebarHeader className="flex items-center justify-between">
        <Logo collapsed={isCollapsed} />
        <SidebarToggle />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="My Products" className="text-base">
              <Link href="/customer/dashboard">
                <LayoutDashboard />
                <span>My Products</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Marketplace" className="text-base">
              <Link href="/marketplace">
                <ShoppingCart />
                <span>Marketplace</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Support" className="text-base">
              <Link href="#">
                <LifeBuoy />
                <span>Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}


export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomerSidebarInner />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between p-4 border-b bg-card gap-2">
            <Link href="/marketplace" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Marketplace
            </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}
