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
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur-sm shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 border border-slate-200">
          <Building2 className="w-4 h-4 text-slate-600" />
          <span className="text-xs font-bold text-slate-900 tracking-tight">
            {user.firm_name || 'Audit Firm'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span>Logged in as:</span>
          <span className="font-semibold text-slate-800">{user.name}</span>
          <Badge variant="role" size="sm">{user.role}</Badge>
        </div>
      </div>

      {/* Evaluator Quick Demo Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
          <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Quick Persona:
        </span>
        <button
          onClick={() => switchUser('rohit@abc.com')}
          className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-colors ${
            user.email === 'rohit@abc.com'
              ? 'bg-blue-50 border-blue-400 text-blue-800 font-semibold'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
          title="Firm A (ABC & Co.) Staff"
        >
          Rohit (ABC Staff)
        </button>
        <button
          onClick={() => switchUser('aman@abc.com')}
          className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-colors ${
            user.email === 'aman@abc.com'
              ? 'bg-indigo-50 border-indigo-400 text-indigo-800 font-semibold'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
          title="Firm A (ABC & Co.) Reviewer"
        >
          Aman (ABC Reviewer)
        </button>
        <button
          onClick={() => switchUser('priya@xyz.com')}
          className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-colors ${
            user.email === 'priya@xyz.com'
              ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
          title="Firm B (XYZ & Co.) Reviewer - Test Isolation"
        >
          Priya (XYZ Reviewer)
        </button>

        <Button variant="outline" size="sm" onClick={logout} className="ml-2 gap-1.5 text-slate-600">
          <LogOut className="w-3.5 h-3.5" /> Logout
        </Button>
      </div>
    </header>
  );
}
