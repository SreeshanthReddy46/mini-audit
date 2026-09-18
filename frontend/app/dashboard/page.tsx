'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { useClients } from '../../hooks/useClients';
import { api } from '../../lib/api';
import { Document } from '../../lib/types';
import { DocumentStatus } from '../../components/documents/DocumentStatus';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { Search, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface DashboardDocument extends Document {
  clientName?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { clients, loading: clientsLoading } = useClients();
  const [recentDocs, setRecentDocs] = useState<DashboardDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    async function loadAllDocuments() {
      if (clients.length === 0) {
        setRecentDocs([]);
        setLoadingDocs(false);
        return;
      }
      try {
        const all: DashboardDocument[] = [];
        for (const client of clients) {
          const docs = await api.get<Document[]>(`/api/clients/${client.id}/documents`);
          all.push(...docs.map((d) => ({ ...d, clientName: client.name })));
        }
        setRecentDocs(all);
      } catch (err) {
        console.error('Failed to load dashboard documents', err);
      } finally {
        setLoadingDocs(false);
      }
    }

    if (!clientsLoading) {
      loadAllDocuments();
    }
  }, [clients, clientsLoading]);

  const underReviewCount = recentDocs.filter(
    (d) => d.status === 'UNDER_REVIEW' || d.status === 'UPLOADED'
  ).length;
  const correctionCount = recentDocs.filter((d) => d.status === 'CORRECTION_REQUIRED').length;
  const approvedCount = recentDocs.filter((d) => d.status === 'APPROVED').length;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  if (clientsLoading || loadingDocs) {
    return <Loading message="Loading workspace dashboard..." />;
  }

  return (
    <div className="space-y-9 bg-white text-neutral-900">
      <div className="pb-4 border-b border-neutral-200">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
          {greeting}, {user?.name}
        </h1>
        <p className="text-base text-neutral-500 mt-1.5">
          {user?.firm_name} · {user?.role === 'REVIEWER' ? 'Certified Reviewer' : 'Audit Staff'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-7 hover-card cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-neutral-700">Pending Review</span>
            <Search className="w-5 h-5 text-neutral-400" />
          </div>
          <p className="text-4xl font-bold text-neutral-900 mt-3">{underReviewCount}</p>
          <span className="text-sm text-neutral-500 mt-1.5 block">Awaiting reviewer evaluation</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-7 hover-card cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-neutral-700">Corrections Required</span>
            <AlertCircle className="w-5 h-5 text-neutral-400" />
          </div>
          <p className="text-4xl font-bold text-neutral-900 mt-3">{correctionCount}</p>
          <span className="text-sm text-neutral-500 mt-1.5 block">Action required by staff</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-7 hover-card cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-neutral-700">Approved Documents</span>
            <CheckCircle2 className="w-5 h-5 text-neutral-400" />
          </div>
          <p className="text-4xl font-bold text-neutral-900 mt-3">{approvedCount}</p>
          <span className="text-sm text-neutral-500 mt-1.5 block">Statutory compliance met</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">
            Active Clients ({clients.length})
          </h2>
          <Link href="/clients">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-md">
              View All Clients <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`} className="block group">
              <div className="p-5 sm:p-6 rounded-xl border border-neutral-200 bg-white hover-card flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 group-hover:text-black">
                    {client.name}
                  </h3>
                  <p className="text-sm text-neutral-500 mt-1">{client.document_count} audit documents</p>
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">
            Recent Documents ({recentDocs.length})
          </h2>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden hover-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50/75 border-b border-neutral-200 text-neutral-600 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Document</th>
                  <th className="py-3.5 px-5">Client</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Version</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-900 text-sm">
                {recentDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-neutral-500">
                      No documents in queue.
                    </td>
                  </tr>
                ) : (
                  recentDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-neutral-50/70 transition-colors group">
                      <td className="py-4 px-5 font-semibold text-neutral-900">{doc.name}</td>
                      <td className="py-4 px-5 text-neutral-600 font-medium">{doc.clientName || '—'}</td>
                      <td className="py-4 px-5">
                        <DocumentStatus status={doc.status} />
                      </td>
                      <td className="py-4 px-5 font-mono text-xs text-neutral-500">v{doc.version}</td>
                      <td className="py-4 px-5 text-right">
                        <Link href={`/documents/${doc.id}`}>
                          <Button size="sm" variant="outline" className="rounded-md">
                            View Document
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
