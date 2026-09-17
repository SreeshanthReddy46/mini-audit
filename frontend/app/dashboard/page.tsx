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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Welcome back, {user?.name}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Active Firm Workspace: <strong className="text-slate-800 font-semibold">{user?.firm_name}</strong> • Role: <strong className="text-slate-800 font-semibold">{user?.role}</strong>
        </p>
      </div>

      {/* 3 Core Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">{underReviewCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting reviewer evaluation</span>
        </div>

        <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50/50 to-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Correction Required</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">{correctionCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Pending staff re-upload</span>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Approved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">{approvedCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Satisfied compliance checks</span>
        </div>
      </div>

      {/* Clients Quick Access */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Active Firm Clients ({clients.length})
          </h3>
          <Link href="/clients">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              View All Clients <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`}>
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{client.name}</h4>
                    <p className="text-[11px] text-slate-400">{client.document_count} audit documents</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Compliance Document Queue */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Audit Document Queue ({recentDocs.length})
        </h3>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Document Name</th>
                  <th className="py-3 px-4 font-bold">Version</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Uploader</th>
                  <th className="py-3 px-4 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{doc.name}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">v{doc.version}</td>
                    <td className="py-3.5 px-4">
                      <DocumentStatus status={doc.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {doc.uploader_name || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/documents/${doc.id}`}>
                        <Button variant="outline" size="sm" className="text-xs py-1">
                          Review
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
