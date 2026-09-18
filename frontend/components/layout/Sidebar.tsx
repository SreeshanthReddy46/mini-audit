'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileCheck2 } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Clients', href: '/clients', icon: Users },
    { label: 'Audit Trail', href: '/audit', icon: FileCheck2 },
  ];

  return (
    <aside className="w-64 border-r border-neutral-200 bg-white text-neutral-900 flex flex-col shrink-0 min-h-screen">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-neutral-200">
        <div className="w-8 h-8 rounded-md bg-neutral-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
          A
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-neutral-900 tracking-tight leading-tight">MINI AUDIT</h1>
          <p className="text-[11px] text-neutral-500 leading-tight">CA Document Review</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
