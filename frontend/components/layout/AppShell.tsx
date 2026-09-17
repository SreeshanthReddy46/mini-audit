'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Loading } from '../ui/Loading';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Root landing page (/) and /login are public showcase / authentication pages
  const isPublicPage = pathname === '/' || pathname === '/login';

  useEffect(() => {
    // Only redirect to /login if user tries to visit a protected page while not authenticated
    if (!loading && !user && !isPublicPage) {
      router.push('/login');
    }
  }, [user, loading, isPublicPage, router]);

  // Render public landing / login page with pure white background
  if (isPublicPage) {
    return <main className="min-h-screen bg-white text-black">{children}</main>;
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <Loading message="Authenticating session..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white text-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <Header />
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto bg-white text-black">{children}</main>
      </div>
    </div>
  );
}
