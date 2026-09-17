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
import { CornerStars } from '../../components/ui/CornerStars';
import { Search, AlertCircle, CheckCircle2, Building, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { clients, loading: clientsLoading } = useClients();
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    async function loadAllDocuments() {
      if (clients.length === 0) {
        setRecentDocs([]);
        setLoadingDocs(false);
        return;
      }
      try {
        const all: Document[] = [];
        for (const client of clients) {
          const docs = await api.get<Document[]>(`/api/clients/${client.id}/documents`);
          all.push(...docs);
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

  const underReviewCount = recentDocs.filter((d) => d.status === 'UNDER_REVIEW' || d.status === 'UPLOADED').length;
  const correctionCount = recentDocs.filter((d) => d.status === 'CORRECTION_REQUIRED').length;
  const approvedCount = recentDocs.filter((d) => d.status === 'APPROVED').length;

  if (clientsLoading || loadingDocs) {
    return <Loading message="Loading workspace dashboard..." />;
  }

  return (
    <div className="space-y-8 bg-white text-neutral-900">
      <div>
        <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
          Welcome back, {user?.name}
        </h2>
        <p className="text-xs text-neutral-600 mt-1 font-medium">
          Active Firm Workspace: <strong className="text-neutral-900 font-bold">{user?.firm_name}</strong> • Role:{' '}
          <strong className="text-neutral-900 font-bold">{user?.role}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="group relative rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs hover:border-neutral-900 transition-all duration-200 hover-lift">
          <CornerStars />
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-900">Pending Review</span>
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-neutral-900 mt-3">{underReviewCount}</p>
          <span className="text-[11px] text-neutral-500 mt-1 block font-medium">Awaiting reviewer evaluation</span>
        </div>

        <div className="group relative rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs hover:border-neutral-900 transition-all duration-200 hover-lift">
          <CornerStars />
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-900">Correction Required</span>
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-neutral-900 mt-3">{correctionCount}</p>
          <span className="text-[11px] text-neutral-500 mt-1 block font-medium">Pending staff re-upload</span>
        </div>

        <div className="group relative rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs hover:border-neutral-900 transition-all duration-200 hover-lift">
          <CornerStars />
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-900">Approved</span>
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-neutral-900 mt-3">{approvedCount}</p>
          <span className="text-[11px] text-neutral-500 mt-1 block font-medium">Satisfied compliance checks</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">
            Active Firm Clients ({clients.length})
          </h3>
          <Link href="/clients">
            <Button variant="outline" size="sm" className="gap-1 text-xs rounded-xl">
              View All Clients <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`} className="block group">
              <div className="relative p-4 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-900 transition-all duration-200 hover-lift flex items-center justify-between shadow-xs">
                <CornerStars size="sm" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-neutral-900">{client.name}</h4>
                    <p className="text-[11px] text-neutral-500 font-medium">{client.document_count} audit documents</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-900 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">
          Audit Document Queue ({recentDocs.length})
        </h3>

        <div className="group relative rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs hover:border-neutral-900 transition-all">
          <CornerStars />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Document Name</th>
                  <th className="py-3.5 px-4 font-bold">Version</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Uploader</th>
                  <th className="py-3.5 px-4 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-900">
                {recentDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-500 font-medium">
                      No documents in queue.
                    </td>
                  </tr>
                ) : (
                  recentDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-neutral-900">{doc.name}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-bold text-neutral-600">v{doc.version}</span>
                      </td>
                      <td className="py-3 px-4">
                        <DocumentStatus status={doc.status} />
                      </td>
                      <td className="py-3 px-4 text-neutral-600 font-medium">{doc.uploader_name || '—'}</td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/documents/${doc.id}`}>
                          <Button size="sm" className="text-xs rounded-xl">
                            View Lifecycle
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
