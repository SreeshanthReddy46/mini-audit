'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Client, Document } from '../../../lib/types';
import { api } from '../../../lib/api';
import { DocumentCard } from '../../../components/documents/DocumentCard';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ArrowLeft, Building, AlertOctagon } from 'lucide-react';

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClientData() {
      setLoading(true);
      setError(null);
      try {
        const clientData = await api.get<Client>(`/api/clients/${clientId}`);
        setClient(clientData);

        const docsData = await api.get<Document[]>(`/api/clients/${clientId}/documents`);
        setDocuments(docsData);
      } catch (err: any) {
        setError(err.message || 'Client not found or belongs to another firm.');
      } finally {
        setLoading(false);
      }
    }
    if (clientId) {
      loadClientData();
    }
  }, [clientId]);

  if (loading) {
    return <Loading message="Loading client audit checklist..." />;
  }

  if (error || !client) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 rounded-lg bg-white border border-neutral-200">
        <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center mx-auto mb-3">
          <AlertOctagon className="w-6 h-6 text-neutral-800" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900">Client Not Found</h3>
        <p className="text-sm text-neutral-600 mt-1 mb-5">
          This client resource does not exist in your authenticated firm workspace.
        </p>
        <Link href="/clients">
          <Button variant="primary" size="md" className="rounded-md">
            Return to Clients
          </Button>
        </Link>
      </div>
    );
  }

  const approvedCount = documents.filter((d) => d.status === 'APPROVED').length;

  return (
    <div className="space-y-8 bg-white text-neutral-900">
      <div className="space-y-4">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-neutral-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900 shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">{client.name}</h1>
              <p className="text-base text-neutral-500 mt-1">
                Statutory Audit Checklist · {client.document_count} compliance requirements
              </p>
            </div>
          </div>

          <div className="text-base text-neutral-600 font-medium">
            <span className="font-bold text-neutral-900 text-lg">{approvedCount}</span> of {documents.length} approved
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Required Documents Checklist
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      </div>
    </div>
  );
}
