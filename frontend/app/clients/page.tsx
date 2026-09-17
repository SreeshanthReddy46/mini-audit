'use client';

import React, { useState } from 'react';
import { useClients } from '../../hooks/useClients';
import { ClientCard } from '../../components/clients/ClientCard';
import { CreateClientModal } from '../../components/clients/CreateClientModal';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { Plus, Users, ShieldAlert } from 'lucide-react';

export default function ClientsPage() {
  const { clients, loading, error, createClient } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) {
    return <Loading message="Loading firm clients..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Audit Clients
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your firm&apos;s corporate audit clients and track document review progress.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Client
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {clients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No clients found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Get started by adding your first audit client to create their compliance document checklist.
          </p>
          <Button onClick={() => setIsModalOpen(true)} size="sm" className="mt-4 gap-1.5">
            <Plus className="w-4 h-4" /> Create First Client
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}

      <CreateClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={createClient}
      />
    </div>
  );
}
