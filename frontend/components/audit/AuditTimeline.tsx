import React from 'react';
import { AuditEvent } from '../../lib/types';
import { CheckCircle2, Clock, Upload, Search, AlertCircle, FilePlus, User, ShieldCheck } from 'lucide-react';

export function AuditTimeline({ events }: { events: AuditEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-neutral-500 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 font-medium">
        No audit events recorded yet.
      </div>
    );
  }

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'CLIENT_CREATED':
        return { label: 'Client Onboarded to Firm', icon: FilePlus };
      case 'DOCUMENT_ADDED':
        return { label: 'Checklist Item Initialized', icon: FilePlus };
      case 'DOCUMENT_UPLOADED':
        return { label: 'Initial File Uploaded', icon: Upload };
      case 'REVIEW_STARTED':
        return { label: 'Compliance Review Initiated', icon: Search };
      case 'CORRECTION_REQUESTED':
        return { label: 'Correction Requested by Reviewer', icon: AlertCircle };
      case 'DOCUMENT_REUPLOADED':
        return { label: 'Revised Document Uploaded', icon: Upload };
      case 'DOCUMENT_APPROVED':
        return { label: 'Document Verified & Approved', icon: CheckCircle2 };
      default:
        return { label: action.replace(/_/g, ' '), icon: Clock };
    }
  };

  return (
    <div className="relative pl-6 space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-neutral-200">
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

        const hasMetadata = event.metadata_json && Object.keys(event.metadata_json).length > 0;
        const version = event.metadata_json?.version;

        return (
          <div key={event.id} className="relative group">
            <div className="absolute -left-[27px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-neutral-900 bg-white text-neutral-900 shadow-xs">
              <Icon className="h-3 w-3" />
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs hover:border-neutral-900 transition-all space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-neutral-900">
                  {config.label}
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {dateStr} • {timeStr}
                </span>
              </div>

              {event.comment && (
                <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 font-medium italic">
                  &ldquo;{event.comment}&rdquo;
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium pt-1">
                <div className="flex items-center gap-1.5">
                  <User className="w-3 h-3 text-neutral-700" />
                  <span className="font-semibold text-neutral-800">{event.actor_name || 'System'}</span>
                  {event.actor_role && (
                    <span className="text-neutral-500">({event.actor_role})</span>
                  )}
                </div>

                {version && (
                  <span className="font-mono font-bold text-neutral-700">
                    v{version}
                  </span>
                )}
              </div>

              {hasMetadata && (
                <details className="pt-2 border-t border-neutral-100 text-[10px] text-neutral-500">
                  <summary className="cursor-pointer font-mono hover:text-neutral-800 select-none flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-neutral-600" />
                    <span>View Audit Record Proof</span>
                  </summary>
                  <pre className="mt-2 p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 font-mono text-[10px] text-neutral-700 overflow-x-auto">
                    {JSON.stringify(event.metadata_json, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
