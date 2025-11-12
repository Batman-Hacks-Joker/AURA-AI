'use client';
import { usePathname } from 'next/navigation';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Chatbot } from '@/components/chatbot';
import { Navbar } from '@/components/navbar';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthenticatedLayout } from './authenticated-layout';
import React from 'react';
import { AuthProvider } from '@/firebase/auth/use-auth';
import { FirebaseClientProvider } from '@/firebase';

// Metadata needs to be exported from a server component, so we can't define it here.
// We will move it to the page.tsx files that are server components.
// export const metadata: Metadata = {
//   title: 'AURA AI',
//   description: 'Your Integrated Commerce Ecosystem',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login');
  const isPublicPage = pathname === '/';
  
  const showAuthenticatedLayout = !isAuthPage && !isPublicPage;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>AURA AI</title>
        <meta name="description" content="Your Integrated Commerce Ecosystem" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700&family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {isPublicPage && <Navbar />}
              
              {showAuthenticatedLayout ? (
                <AuthenticatedLayout>{children}</AuthenticatedLayout>
              ) : (
                <main className={isPublicPage ? 'pt-16' : ''}>{children}</main>
              )}

              <Toaster />
              <Chatbot />
            </ThemeProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
