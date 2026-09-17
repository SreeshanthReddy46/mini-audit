'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Client, Document } from '../../../lib/types';
import { api } from '../../../lib/api';
import { DocumentCard } from '../../../components/documents/DocumentCard';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { CornerStars } from '../../../components/ui/CornerStars';
import { ArrowLeft, Building, FileCheck2, AlertOctagon } from 'lucide-react';

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
    return <Loading message="Loading client audit workspace..." />;
  }

  if (error || !client) {
    return (
      <div className="group relative max-w-md mx-auto my-12 text-center p-8 rounded-2xl bg-white border-2 border-neutral-900 shadow-sm hover-lift">
        <CornerStars />
        <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center mx-auto mb-3">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-black text-neutral-900">Tenant Access Denied (404)</h3>
        <p className="text-xs text-neutral-600 mt-1 mb-4 font-medium">
          This client resource does not exist in your authenticated firm workspace.
        </p>
        <Link href="/clients">
          <Button variant="outline" size="sm" className="rounded-xl border-neutral-300 text-neutral-800 hover:bg-neutral-900 hover:text-white">
            Return to Clients
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white text-neutral-900">
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-neutral-950 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Clients List
      </Link>

      <div className="group relative p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs hover-lift">
        <CornerStars />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 flex items-center justify-center text-white transition-transform group-hover:scale-105">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-neutral-900 tracking-tight">{client.name}</h2>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                Client Audit Workspace • Standard Compliance Package
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-600 font-medium">
              5 Required Audit Checklist Documents
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-neutral-900" />
            Compliance Checklist & Audit Documents
          </h3>
          <span className="text-xs text-neutral-500 font-medium">
            {documents.filter((d) => d.status === 'APPROVED').length} of {documents.length} approved
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      </div>
    </div>
  );
}
