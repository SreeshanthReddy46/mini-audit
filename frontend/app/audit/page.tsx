'use client';

import React, { useEffect, useState } from 'react';
import { AuditEvent } from '../../lib/types';
import { api } from '../../lib/api';
import { AuditTimeline } from '../../components/audit/AuditTimeline';
import { Loading } from '../../components/ui/Loading';
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
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-600" />
            Firm Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable, append-only log of all regulatory compliance and document actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Actions ({events.length})</option>
            {actionsList.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Traceability Log</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Showing {filteredEvents.length} events
          </span>
        </div>

        <AuditTimeline events={filteredEvents} />
      </div>
    </div>
  );
}
