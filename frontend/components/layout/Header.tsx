'use client';

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Building2, LogOut, UserCheck } from 'lucide-react';

export function Header() {
  const { user, logout, switchUser } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200/90 bg-white/90 backdrop-blur-md px-6 py-2.5 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-neutral-900">
          <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-neutral-900 tracking-tight">
                {user.firm_name || 'Audit Firm'}
              </span>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500 font-medium pl-3 border-l border-neutral-200">
          <span>Active:</span>
          <span className="font-bold text-neutral-900">{user.name}</span>
          <span className="font-mono text-neutral-500">({user.role})</span>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-0.5">
        <div className="flex items-center gap-1 bg-neutral-100/90 p-1 rounded-xl border border-neutral-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-2 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-neutral-700" /> Persona:
          </span>
          <button
            onClick={() => switchUser('rohit@abc.com')}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
              user.email === 'rohit@abc.com'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-700 hover:text-neutral-950 hover:bg-white'
            }`}
            title="Firm A (ABC & Co.) Staff"
          >
            Rohit (Staff)
          </button>
          <button
            onClick={() => switchUser('aman@abc.com')}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
              user.email === 'aman@abc.com'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-700 hover:text-neutral-950 hover:bg-white'
            }`}
            title="Firm A (ABC & Co.) Reviewer"
          >
            Aman (Reviewer)
          </button>
          <button
            onClick={() => switchUser('priya@xyz.com')}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
              user.email === 'priya@xyz.com'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-700 hover:text-neutral-950 hover:bg-white'
            }`}
            title="Firm B (XYZ & Co.) Reviewer - Test Isolation"
          >
            Priya (Firm B)
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="gap-1.5 text-neutral-800 border-neutral-300 hover:bg-neutral-900 hover:text-white rounded-xl text-xs"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </Button>
      </div>
    </header>
  );
}
