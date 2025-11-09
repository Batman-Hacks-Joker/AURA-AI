
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
  Home,
  Star,
  LogOut,
  PackagePlus,
  Warehouse,
  Store,
  Wrench,
  ArrowRightToLine,
  ArrowLeftToLine,
} from "lucide-react";
import Link from "next/link";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "./user-menu";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
                <UserMenu />
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
        <header className="sticky top-0 z-50 flex h-16 items-center justify-center p-4 border-b bg-card gap-4">
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
        </header>
        <main className="p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
