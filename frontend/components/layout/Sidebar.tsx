'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileCheck2, ShieldCheck } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Clients', href: '/clients', icon: Users },
    { label: 'Audit Trail', href: '/audit', icon: FileCheck2 },
  ];

  return (
    <aside className="w-64 border-r border-neutral-200 bg-white text-black flex flex-col shrink-0 min-h-screen">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-neutral-200">
        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white font-black text-sm shadow-xs">
          A
        </div>
        <div>
          <h1 className="text-sm font-black text-black tracking-tight">MINI AUDIT</h1>
          <p className="text-[10px] text-neutral-500 font-medium">CA Document Review</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
                isActive
                  ? 'bg-black text-white shadow-xs'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-200 bg-neutral-50 text-[11px] text-black">
        <div className="flex items-center gap-1.5 font-bold text-black mb-1">
          <span className="w-2 h-2 rounded-full bg-black"></span>
          Tenant Isolation Active
        </div>
        <p className="text-[10px] text-neutral-600 font-medium">
          Row-level security enforced on backend (404 on breach).
        </p>
      </div>
    </aside>
  );
}
