'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { CornerStars } from '../../components/ui/CornerStars';
import { ShieldCheck, ArrowRight, ArrowLeft, UserCheck, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If redirected with pre-filled email from persona link on root page
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // If already authenticated, forward to dashboard
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
    <div className="min-h-screen bg-white text-black flex flex-col justify-between p-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Product Showcase
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black text-white shadow-md mb-3 animate-float-slow">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-black tracking-tight">MINI AUDIT</h1>
          <p className="text-xs text-neutral-600 mt-1 font-medium">
            Sign in to access your tenant workspace
          </p>
        </div>

        <div className="group relative bg-white rounded-2xl border-2 border-black p-8 shadow-sm hover-lift">
          <CornerStars size="lg" />

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-neutral-100 border border-black text-xs text-black font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-black" />
              {error}
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

            <Button type="submit" className="w-full gap-2 mt-2" loading={loading}>
              Sign In to Workspace
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Evaluator 1-Click Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <div className="flex items-center gap-1.5 text-xs font-black text-black mb-3 uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-black" />
              1-Click Demo Accounts (Evaluation):
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillDemo('rohit@abc.com')}
                className="group/demo relative w-full text-left p-3 rounded-xl border border-neutral-300 hover:border-black hover:bg-neutral-50 transition-all duration-200 hover-lift flex items-center justify-between text-xs"
              >
                <CornerStars size="sm" />
                <div>
                  <span className="font-bold text-black">Firm A: Rohit</span>
                  <span className="ml-2 text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-black text-white">
                    STAFF
                  </span>
                  <p className="text-[11px] text-neutral-500 font-mono mt-0.5">rohit@abc.com</p>
                </div>
                <span className="text-xs font-bold text-black border border-black px-2 py-0.5 rounded group-hover/demo:bg-black group-hover/demo:text-white transition-colors">
                  Select
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('aman@abc.com')}
                className="group/demo relative w-full text-left p-3 rounded-xl border border-neutral-300 hover:border-black hover:bg-neutral-50 transition-all duration-200 hover-lift flex items-center justify-between text-xs"
              >
                <CornerStars size="sm" />
                <div>
                  <span className="font-bold text-black">Firm A: Aman</span>
                  <span className="ml-2 text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-black text-white">
                    REVIEWER
                  </span>
                  <p className="text-[11px] text-neutral-500 font-mono mt-0.5">aman@abc.com</p>
                </div>
                <span className="text-xs font-bold text-black border border-black px-2 py-0.5 rounded group-hover/demo:bg-black group-hover/demo:text-white transition-colors">
                  Select
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('priya@xyz.com')}
                className="group/demo relative w-full text-left p-3 rounded-xl border border-neutral-300 hover:border-black hover:bg-neutral-50 transition-all duration-200 hover-lift flex items-center justify-between text-xs"
              >
                <CornerStars size="sm" />
                <div>
                  <span className="font-bold text-black">Firm B: Priya</span>
                  <span className="ml-2 text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-black text-white">
                    REVIEWER (TENANT B)
                  </span>
                  <p className="text-[11px] text-neutral-500 font-mono mt-0.5">priya@xyz.com</p>
                </div>
                <span className="text-xs font-bold text-black border border-black px-2 py-0.5 rounded group-hover/demo:bg-black group-hover/demo:text-white transition-colors">
                  Select
                </span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 mt-3 text-center font-medium">
              Default password for all accounts: <code className="text-black font-bold">password123</code>
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-neutral-500 pb-4 font-medium">
        Deterministic backend rules enforce authentication, authorization, and tenant isolation.
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
