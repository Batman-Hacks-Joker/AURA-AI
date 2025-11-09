
'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from './admin/layout';
import CustomerLayout from './customer/layout';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';

type LoggedInUser = {
  email: string;
  role: 'admin' | 'customer';
};

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Redirect if user is on the wrong dashboard
      if (pathname.startsWith('/admin') && parsedUser.role !== 'admin') {
        router.replace('/customer/dashboard');
      } else if (pathname.startsWith('/customer') && parsedUser.role !== 'customer') {
        router.replace('/admin/dashboard');
      }

    } else {
      router.replace('/login');
    }
    setIsLoading(false);
  }, [pathname, router]);

  if (isLoading || !user) {
    // You can render a loading spinner here
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const LayoutComponent = user.role === 'admin' ? AdminLayout : CustomerLayout;

  return (
    <SidebarProvider>
        <LayoutComponent>{children}</LayoutComponent>
    </SidebarProvider>
  );
}
