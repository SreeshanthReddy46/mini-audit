import React from 'react';
import { AuditEvent } from '../../lib/types';
import { CheckCircle2, Clock, Upload, Search, AlertCircle, FilePlus, User } from 'lucide-react';

export function AuditTimeline({ events }: { events: AuditEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        No audit events recorded yet.
      </div>
    );
  }

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'CLIENT_CREATED':
        return { label: 'Client Created', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: FilePlus };
      case 'DOCUMENT_ADDED':
        return { label: 'Document Added to Checklist', color: 'text-slate-600 bg-slate-50 border-slate-200', icon: FilePlus };
      case 'DOCUMENT_UPLOADED':
        return { label: 'Uploaded Document', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Upload };
      case 'REVIEW_STARTED':
        return { label: 'Started Review', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: Search };
      case 'CORRECTION_REQUESTED':
        return { label: 'Requested Correction', color: 'text-amber-700 bg-amber-50 border-amber-300', icon: AlertCircle };
      case 'DOCUMENT_REUPLOADED':
        return { label: 'Uploaded Revised Document', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Upload };
      case 'DOCUMENT_APPROVED':
        return { label: 'Approved Document', color: 'text-emerald-700 bg-emerald-50 border-emerald-300', icon: CheckCircle2 };
      default:
        return { label: action, color: 'text-slate-600 bg-slate-50 border-slate-200', icon: Clock };
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-slate-200">
      {events.map((event) => {
        const config = getActionConfig(event.action);
        const Icon = config.icon;
        const timeStr = new Date(event.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        const dateStr = new Date(event.created_at).toLocaleDateString([], {
          day: 'numeric',
          month: 'short',
        });

        return (
          <div key={event.id} className="relative group">
            {/* Timeline node */}
            <div
              className={`absolute -left-[27px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white shadow-xs ${config.color}`}
            >
              <Icon className="h-3 w-3" />
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs hover:border-slate-300 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{event.actor_name || 'System'}</span>
                  {event.actor_role && (
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {event.actor_role}
                    </span>
                  )}
                  <span className="font-normal text-slate-500">• {config.label}</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  {dateStr}, {timeStr}
                </span>
              </div>

              {event.comment && (
                <div className="mt-2 rounded-md bg-slate-50 p-2.5 text-xs text-slate-700 border border-slate-100 italic">
                  &ldquo;{event.comment}&rdquo;
                </div>
              )}

              {event.metadata_json && Object.keys(event.metadata_json).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-slate-400">
                  {event.metadata_json.filename && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      File: {event.metadata_json.filename}
                    </span>
                  )}
                  {event.metadata_json.version && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      v{event.metadata_json.version}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
