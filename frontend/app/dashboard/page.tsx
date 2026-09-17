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
    <div className="space-y-8 bg-white text-black">
      {/* Welcome Header */}
      <div>
        <h2 className="text-2xl font-black text-black tracking-tight">
          Welcome back, {user?.name}
        </h2>
        <p className="text-xs text-neutral-600 mt-1 font-medium">
          Active Firm Workspace: <strong className="text-black font-bold">{user?.firm_name}</strong> • Role:{' '}
          <strong className="text-black font-bold">{user?.role}</strong>
        </p>
      </div>

      {/* 3 Core Metric Cards (Pure White & Black) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-black">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-black mt-3">{underReviewCount}</p>
          <span className="text-[11px] text-neutral-500 mt-1 block font-medium">Awaiting reviewer evaluation</span>
        </div>

        <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-black">Correction Required</span>
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-black mt-3">{correctionCount}</p>
          <span className="text-[11px] text-neutral-500 mt-1 block font-medium">Pending staff re-upload</span>
        </div>

        <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-black">Approved</span>
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-black mt-3">{approvedCount}</p>
          <span className="text-[11px] text-neutral-500 mt-1 block font-medium">Satisfied compliance checks</span>
        </div>
      </div>

      {/* Clients Quick Access */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-black">
            Active Firm Clients ({clients.length})
          </h3>
          <Link href="/clients">
            <Button variant="outline" size="sm" className="gap-1 text-xs border-black text-black hover:bg-black hover:text-white">
              View All Clients <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`}>
              <div className="p-4 rounded-xl border border-neutral-300 bg-white hover:border-black transition-all flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-black">{client.name}</h4>
                    <p className="text-[11px] text-neutral-500 font-medium">{client.document_count} audit documents</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-black" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Compliance Document Queue */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-black">
          Audit Document Queue ({recentDocs.length})
        </h3>

        <div className="rounded-xl border border-neutral-300 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 border-b border-neutral-200 text-black uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Document Name</th>
                  <th className="py-3 px-4 font-bold">Version</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Uploader</th>
                  <th className="py-3 px-4 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-black">
                {recentDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-500 font-medium">
                      No documents created yet.
                    </td>
                  </tr>
                ) : (
                  recentDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-black">{doc.name}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-bold text-black">v{doc.version}</span>
                      </td>
                      <td className="py-3 px-4">
                        <DocumentStatus status={doc.status} />
                      </td>
                      <td className="py-3 px-4 text-neutral-600 font-medium">{doc.uploader_name || '—'}</td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/documents/${doc.id}`}>
                          <Button size="sm" className="text-xs">
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
