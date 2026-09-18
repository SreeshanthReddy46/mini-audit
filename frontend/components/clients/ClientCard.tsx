import React from 'react';
import Link from 'next/link';
import { Client } from '../../lib/types';
import { Button } from '../ui/Button';
import { Building, ArrowRight } from 'lucide-react';

export function ClientCard({ client }: { client: Client }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 flex flex-col justify-between hover-card">
      <div>
        <div className="flex items-center gap-3.5 mb-3">
          <div className="w-11 h-11 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900 shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 line-clamp-1">{client.name}</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Added {new Date(client.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <p className="text-sm text-neutral-600 mb-5">
          {client.document_count} compliance documents in checklist
        </p>
      </div>

      <Link href={`/clients/${client.id}`} className="w-full">
        <Button variant="outline" size="sm" className="w-full justify-between rounded-md py-2.5 px-3.5 group font-medium">
          <span>View Checklist</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  );
}
