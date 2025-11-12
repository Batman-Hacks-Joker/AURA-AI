'use client';

import React from 'react';
import AdminLayout from './admin/layout';
import CustomerLayout from './customer/layout';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/firebase/auth/use-auth';


export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);
  
  if (loading || !user || !role) {
    // You can render a loading spinner here
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // Redirect if user is on the wrong dashboard
  if (pathname.startsWith('/admin') && role !== 'admin') {
    router.replace('/customer/dashboard');
    return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>;
  } else if (pathname.startsWith('/customer') && role !== 'admin') { // Allow admin to see customer pages for now
    // Keep admin on customer page if they navigate there.
  } else if (pathname.startsWith('/customer') && role === 'customer') {
    // allow
  }


  const LayoutComponent = role === 'admin' ? AdminLayout : CustomerLayout;

  return (
    <SidebarProvider>
        <LayoutComponent>{children}</LayoutComponent>
    </SidebarProvider>
  );
}
