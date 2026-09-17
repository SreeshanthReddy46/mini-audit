'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginResponse } from '../lib/types';
import { api } from '../lib/api';
import { getStoredToken, getStoredUser, setStoredToken, setStoredUser, removeStoredToken } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (email: string, password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const stored = getStoredUser();
      const token = getStoredToken();

      if (token && stored) {
        setUser(stored);
        try {
          const me = await api.get<User>('/api/auth/me');
          setUser(me);
          setStoredUser(me);
        } catch {
          removeStoredToken();
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password = 'password123') => {
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>('/api/auth/login', { email, password });
      setStoredToken(res.access_token);
      setStoredUser(res.user);
      setUser(res.user);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
    }
    removeStoredToken();
    setUser(null);
    router.push('/login');
  };

  const switchUser = async (email: string, password = 'password123') => {
    await login(email, password);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
