'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileCheck2, ShieldAlert } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Clients', href: '/clients', icon: Users },
    { label: 'Audit Trail', href: '/audit', icon: FileCheck2 },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-800">
        <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          A
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">MINI AUDIT</h1>
          <p className="text-[10px] text-slate-400">Document Review System</p>
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
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 font-medium text-emerald-400 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Tenant Isolation Active
        </div>
        <p className="text-[10px] text-slate-500">Row-level security enforced on backend.</p>
      </div>
    </aside>
  );
}
