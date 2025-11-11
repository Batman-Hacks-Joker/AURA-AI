'use client';

import React from 'react';
import AdminLayout from './admin/layout';
import CustomerLayout from './customer/layout';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/firebase/auth/use-auth';


export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    // You can render a loading spinner here
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // This is a placeholder, in a real app you would fetch the user's role from your database
  const role = 'customer'; 

  // Redirect if user is on the wrong dashboard
  if (pathname.startsWith('/admin') && role !== 'admin') {
    router.replace('/customer/dashboard');
    return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>;
  } else if (pathname.startsWith('/customer') && role !== 'customer') {
    router.replace('/admin/dashboard');
    return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>;
  }

  const LayoutComponent = role === 'admin' ? AdminLayout : CustomerLayout;

  return (
    <SidebarProvider>
        <LayoutComponent>{children}</LayoutComponent>
    </SidebarProvider>
  );
}
