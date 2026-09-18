'use client';

import React, { useEffect, useState } from 'react';
import { AuditEvent } from '../../lib/types';
import { api } from '../../lib/api';
import { AuditTimeline } from '../../components/audit/AuditTimeline';
import { Loading } from '../../components/ui/Loading';
import { FileCheck2, Filter } from 'lucide-react';

export default function FirmAuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  useEffect(() => {
    async function loadAuditLog() {
      setLoading(true);
      try {
        const data = await api.get<AuditEvent[]>('/api/audit');
        setEvents(data);
      } catch (err) {
        console.error('Failed to load audit events', err);
      } finally {
        setLoading(false);
      }
    }
    loadAuditLog();
  }, []);

  const filteredEvents = selectedAction === 'ALL'
    ? events
    : events.filter((e) => e.action === selectedAction);

  if (loading) {
    return <Loading message="Loading firm immutable audit records..." />;
  }

  const actionsList = Array.from(new Set(events.map((e) => e.action)));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-neutral-200">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
            <FileCheck2 className="w-6 h-6 text-neutral-800" />
            Firm Audit Trail
          </h1>
          <p className="text-base text-neutral-500 mt-1.5">
            Immutable, append-only log of regulatory compliance and document lifecycle transitions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Filter className="w-4.5 h-4.5 text-neutral-500" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none font-medium"
          >
            <option value="ALL">All Actions ({events.length})</option>
            {actionsList.map((action) => (
              <option key={action} value={action}>
                {action.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-8 hover-card">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-6">
          <span className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            Traceability Log
          </span>
          <span className="text-xs font-mono text-neutral-500">
            Showing {filteredEvents.length} events
          </span>
        </div>

        <AuditTimeline events={filteredEvents} />
      </div>
    </div>
  );
}
