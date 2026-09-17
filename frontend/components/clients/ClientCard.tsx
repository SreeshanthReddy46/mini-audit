import React from 'react';
import Link from 'next/link';
import { Client } from '../../lib/types';
import { Button } from '../ui/Button';
import { Building, ArrowRight, FileCheck } from 'lucide-react';

export function ClientCard({ client }: { client: Client }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{client.name}</h3>
            <p className="text-[11px] text-slate-400">
              Added {new Date(client.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 mb-4">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <span>
            <strong className="font-semibold text-slate-800">{client.document_count}</strong> compliance documents
          </span>
        </div>
      </div>

      <Link href={`/clients/${client.id}`} className="w-full">
        <Button variant="outline" size="sm" className="w-full justify-between group">
          <span>View Audit Workspace</span>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </Link>
    </div>
  );
}
