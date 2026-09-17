'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-md mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">MINI AUDIT</h1>
          <p className="text-xs text-slate-500 mt-1">
            Chartered Accountant Document Review & Compliance System
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xl">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. rohit@abc.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full gap-2 mt-2" loading={loading}>
              Sign In to Workspace
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Evaluator 1-Click Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-blue-600" />
              1-Click Demo Accounts (Evaluation):
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillDemo('rohit@abc.com')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800">Firm A: Rohit</span>
                  <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                    STAFF
                  </span>
                  <p className="text-[11px] text-slate-500 font-mono">rohit@abc.com</p>
                </div>
                <span className="text-[11px] font-semibold text-blue-600">Select</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('aman@abc.com')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800">Firm A: Aman</span>
                  <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    REVIEWER
                  </span>
                  <p className="text-[11px] text-slate-500 font-mono">aman@abc.com</p>
                </div>
                <span className="text-[11px] font-semibold text-indigo-600">Select</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('priya@xyz.com')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800">Firm B: Priya</span>
                  <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    REVIEWER (TENANT B)
                  </span>
                  <p className="text-[11px] text-slate-500 font-mono">priya@xyz.com</p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600">Select</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              Default password for all accounts: <code>password123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
