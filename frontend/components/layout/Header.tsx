'use client';

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Building2, LogOut } from 'lucide-react';

export function Header() {
  const { user, logout, switchUser } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-4 border-b border-neutral-200 bg-white px-8">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2.5 text-neutral-900 shrink-0">
          <Building2 className="w-4.5 h-4.5 text-neutral-500" />
          <span className="text-sm font-semibold text-neutral-900 truncate">
            {user.firm_name || 'Audit Firm'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500 pl-4 border-l border-neutral-200 shrink-0">
          <span className="font-semibold text-neutral-800">{user.name}</span>
          <span className="font-mono text-neutral-400">({user.role})</span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center bg-neutral-100 p-1 rounded-lg border border-neutral-200/80 text-xs">
          <button
            onClick={() => switchUser('rohit@abc.com')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              user.email === 'rohit@abc.com'
                ? 'bg-white text-neutral-900 font-semibold shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Rohit (Staff)
          </button>
          <button
            onClick={() => switchUser('aman@abc.com')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              user.email === 'aman@abc.com'
                ? 'bg-white text-neutral-900 font-semibold shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Aman (Reviewer)
          </button>
          <button
            onClick={() => switchUser('priya@xyz.com')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              user.email === 'priya@xyz.com'
                ? 'bg-white text-neutral-900 font-semibold shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Priya (Firm B)
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="gap-1.5 rounded-md text-xs"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </Button>
      </div>
    </header>
  );
}
