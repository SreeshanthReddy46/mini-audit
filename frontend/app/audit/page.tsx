'use client';

import React, { useEffect, useState } from 'react';
import { AuditEvent } from '../../lib/types';
import { api } from '../../lib/api';
import { AuditTimeline } from '../../components/audit/AuditTimeline';
import { Loading } from '../../components/ui/Loading';
import { CornerStars } from '../../components/ui/CornerStars';
import { ShieldCheck, FileCheck2, Filter } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-neutral-900" />
            Firm Audit Trail
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5 font-medium">
            Immutable, append-only log of all regulatory compliance and document lifecycle transitions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-500" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
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

      <div className="group relative rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs hover-lift">
        <CornerStars />
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
            <ShieldCheck className="w-4 h-4 text-neutral-900" />
            <span>Traceability Log</span>
          </div>
          <span className="text-[11px] text-neutral-500 font-medium">
            Showing {filteredEvents.length} events
          </span>
        </div>

        <AuditTimeline events={filteredEvents} />
      </div>
    </div>
  );
}
