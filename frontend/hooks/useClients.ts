'use client';

import { useState, useEffect, useCallback } from 'react';
import { Client } from '../lib/types';
import { api } from '../lib/api';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Client[]>('/api/clients');
      setClients(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const createClient = async (name: string): Promise<Client> => {
    const newClient = await api.post<Client>('/api/clients', { name });
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  return { clients, loading, error, refreshClients: fetchClients, createClient };
}
