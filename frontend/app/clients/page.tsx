'use client';

import React, { useState } from 'react';
import { useClients } from '../../hooks/useClients';
import { ClientCard } from '../../components/clients/ClientCard';
import { CreateClientModal } from '../../components/clients/CreateClientModal';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { Plus, Users, AlertCircle } from 'lucide-react';

export default function ClientsPage() {
  const { clients, loading, error, createClient } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) {
    return <Loading message="Loading firm clients..." />;
  }

  return (
    <div className="space-y-6 bg-white text-black">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-black text-black tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-black" />
            Audit Clients
          </h2>
          <p className="text-xs text-neutral-600 mt-0.5 font-medium">
            Manage your firm&apos;s corporate audit clients and track document review progress.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Client
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-neutral-100 border border-black text-xs text-black font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-black" />
          {error}
        </div>
      )}

      {clients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-neutral-300 p-8">
          <Users className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-black">No clients found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto font-medium">
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
