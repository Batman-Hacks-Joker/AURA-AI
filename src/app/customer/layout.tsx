
'use client';
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
  LayoutDashboard,
  ShoppingCart,
  LifeBuoy,
  User,
  LogOut,
  Settings,
  ArrowLeftToLine,
  ArrowRightToLine,
} from "lucide-react";
import Link from "next/link";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "./user-menu";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        // A bit of a hack to ensure clicking the sidebar rail doesn't trigger a toggle
        // when the sidebar is collapsed, as the rail has its own toggle logic.
        const isRailClick = (e.target as HTMLElement).closest('[data-sidebar="rail"]');
        const isCollapsed = e.currentTarget.getAttribute('data-state') === 'collapsed';
        if (!isRailClick || !isCollapsed) {
          const { toggleSidebar } = (e.currentTarget as any)._sidebarContext;
          if (toggleSidebar) toggleSidebar();
        }
      }}>
        <SidebarHeader className="flex items-center justify-between">
          <Logo />
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
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 items-center justify-end p-4 border-b bg-card gap-2">
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
