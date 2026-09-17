import React from 'react';
import Link from 'next/link';
import { Client } from '../../lib/types';
import { Button } from '../ui/Button';
import { Building, ArrowRight, FileCheck } from 'lucide-react';

export function ClientCard({ client }: { client: Client }) {
  return (
    <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-xs hover:border-black transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black line-clamp-1">{client.name}</h3>
            <p className="text-[11px] text-neutral-500 font-medium">
              Added {new Date(client.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-neutral-100 border border-neutral-200 text-xs text-black mb-4">
          <FileCheck className="w-4 h-4 text-black" />
          <span>
            <strong className="font-bold text-black">{client.document_count}</strong> compliance documents
          </span>
        </div>
      </div>

      <Link href={`/clients/${client.id}`} className="w-full">
        <Button variant="outline" size="sm" className="w-full justify-between group border-black hover:bg-black hover:text-white">
          <span>View Audit Workspace</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </Link>
    </div>
  );
}
