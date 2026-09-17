import './globals.css';
import React from 'react';
import { AuthProvider } from '../hooks/useAuth';
import { AppShell } from '../components/layout/AppShell';

export const metadata = {
  title: 'Mini Audit Document Review System',
  description: 'Production-minded Audit Document Review Prototype for CA Firms',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
