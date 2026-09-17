'use client';

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Building2, LogOut, UserCheck } from 'lucide-react';

export function Header() {
  const { user, logout, switchUser } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 bg-white px-6 py-3.5 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-1.5 border border-neutral-300">
          <Building2 className="w-4 h-4 text-black" />
          <span className="text-xs font-black text-black tracking-tight">
            {user.firm_name || 'Audit Firm'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-600 font-medium">
          <span>Logged in as:</span>
          <span className="font-bold text-black">{user.name}</span>
          <Badge variant="role" size="sm">{user.role}</Badge>
        </div>
      </div>

      {/* Evaluator Quick Demo Persona Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-black mr-1 flex items-center gap-1">
          <UserCheck className="w-3.5 h-3.5 text-black" /> Quick Persona:
        </span>
        <button
          onClick={() => switchUser('rohit@abc.com')}
          className={`px-2.5 py-1 text-xs rounded-md font-bold transition-all border ${
            user.email === 'rohit@abc.com'
              ? 'bg-black text-white border-black shadow-2xs'
              : 'bg-white text-black border-neutral-300 hover:bg-neutral-100'
          }`}
          title="Firm A (ABC & Co.) Staff"
        >
          Rohit (ABC Staff)
        </button>
        <button
          onClick={() => switchUser('aman@abc.com')}
          className={`px-2.5 py-1 text-xs rounded-md font-bold transition-all border ${
            user.email === 'aman@abc.com'
              ? 'bg-black text-white border-black shadow-2xs'
              : 'bg-white text-black border-neutral-300 hover:bg-neutral-100'
          }`}
          title="Firm A (ABC & Co.) Reviewer"
        >
          Aman (ABC Reviewer)
        </button>
        <button
          onClick={() => switchUser('priya@xyz.com')}
          className={`px-2.5 py-1 text-xs rounded-md font-bold transition-all border ${
            user.email === 'priya@xyz.com'
              ? 'bg-black text-white border-black shadow-2xs'
              : 'bg-white text-black border-neutral-300 hover:bg-neutral-100'
          }`}
          title="Firm B (XYZ & Co.) Reviewer - Test Isolation"
        >
          Priya (XYZ Reviewer)
        </button>

        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="ml-2 gap-1.5 text-black border-black hover:bg-black hover:text-white"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </Button>
      </div>
    </header>
  );
}
