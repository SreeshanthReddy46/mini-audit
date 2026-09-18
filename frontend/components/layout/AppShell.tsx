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

  const isPublicPage = pathname === '/' || pathname === '/login';

  useEffect(() => {
    if (!loading && !user && !isPublicPage) {
      router.push('/login');
    }
  }, [user, loading, isPublicPage, router]);

  if (isPublicPage) {
    return <main className="min-h-screen bg-white text-neutral-900">{children}</main>;
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-neutral-900">
        <Loading message="Authenticating session..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white text-neutral-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <Header />
        <main className="flex-1 px-8 lg:px-12 py-8 max-w-[1600px] w-full mx-auto bg-white text-neutral-900">
          {children}
        </main>
      </div>
    </div>
  );
}
