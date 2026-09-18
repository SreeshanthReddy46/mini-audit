'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
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
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col justify-between p-8 sm:p-12">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Product Showcase
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-900 text-white mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">MINI AUDIT</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Sign in to access your firm workspace
          </p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-8 space-y-5 hover-card">
          {error && (
            <div className="p-3.5 rounded-md bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 flex items-center gap-2.5">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-neutral-700" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. aman@abc.com"
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

            <Button type="submit" size="md" className="w-full gap-2 rounded-md mt-2 font-semibold" loading={loading}>
              Sign In <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="pt-5 border-t border-neutral-100 space-y-3">
            <span className="text-xs font-semibold text-neutral-500 block uppercase tracking-wider">
              1-Click Demo Accounts
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillDemo('rohit@abc.com')}
                className="w-full text-left p-3.5 rounded-lg border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50/50 transition-colors flex items-center justify-between text-sm hover-lift-subtle"
              >
                <div>
                  <span className="font-semibold text-neutral-900">Rohit</span>
                  <span className="ml-2 text-xs font-mono text-neutral-500">Firm A · Staff</span>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">rohit@abc.com</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </button>

              <button
                type="button"
                onClick={() => fillDemo('aman@abc.com')}
                className="w-full text-left p-3.5 rounded-lg border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50/50 transition-colors flex items-center justify-between text-sm hover-lift-subtle"
              >
                <div>
                  <span className="font-semibold text-neutral-900">Aman</span>
                  <span className="ml-2 text-xs font-mono text-neutral-500">Firm A · Reviewer</span>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">aman@abc.com</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </button>

              <button
                type="button"
                onClick={() => fillDemo('priya@xyz.com')}
                className="w-full text-left p-3.5 rounded-lg border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50/50 transition-colors flex items-center justify-between text-sm hover-lift-subtle"
              >
                <div>
                  <span className="font-semibold text-neutral-900">Priya</span>
                  <span className="ml-2 text-xs font-mono text-neutral-500">Firm B · Reviewer</span>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">priya@xyz.com</p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
            <p className="text-xs text-neutral-400 text-center pt-1.5">
              Default password: <code className="text-neutral-700 font-mono">password123</code>
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-neutral-400 pb-2">
        Deterministic backend rules enforce authentication, authorization, and tenant isolation.
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-xs text-neutral-400">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
