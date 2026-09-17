'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Client, Document } from '../../../lib/types';
import { api } from '../../../lib/api';
import { DocumentCard } from '../../../components/documents/DocumentCard';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
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
      <div className="max-w-md mx-auto my-12 text-center p-8 rounded-2xl bg-white border border-rose-200 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Tenant Access Denied (404)</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          This client resource does not exist in your authenticated firm workspace.
        </p>
        <Link href="/clients">
          <Button variant="outline" size="sm">
            Return to Clients
          </Button>
        </Link>
      </div>
    );
  }

  const approvedDocs = documents.filter((d) => d.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link href="/clients" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </Link>
      </div>

      {/* Client Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{client.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory Audit Workspace • Added {new Date(client.created_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Compliance Progress</span>
            <span className="text-sm font-black text-slate-800">
              {approvedDocs} of {documents.length} Approved
            </span>
          </div>
        </div>
      </div>

      {/* Required Compliance Documents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-blue-600" />
            Statutory Audit Checklist ({documents.length} Required Documents)
          </h3>
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
