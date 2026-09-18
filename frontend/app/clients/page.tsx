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
    <div className="space-y-8 bg-white text-neutral-900">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-neutral-200">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
            <Users className="w-6 h-6 text-neutral-800" />
            Audit Clients
          </h1>
          <p className="text-base text-neutral-500 mt-1.5">
            Manage your corporate clients and track statutory compliance progress.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} size="md" className="gap-2 rounded-md font-semibold">
          <Plus className="w-4 h-4" /> Add Client
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-neutral-700" />
          <span>{error}</span>
        </div>
      )}

      {clients.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-neutral-200 p-10">
          <Users className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900">No clients registered</h3>
          <p className="text-sm text-neutral-500 mt-1.5 max-w-sm mx-auto">
            Get started by adding your first audit client to create their compliance document checklist.
          </p>
          <Button onClick={() => setIsModalOpen(true)} size="md" className="mt-5 gap-2 rounded-md">
            <Plus className="w-4 h-4" /> Create Client
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
