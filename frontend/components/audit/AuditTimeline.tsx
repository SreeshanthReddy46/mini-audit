import React from 'react';
import { AuditEvent } from '../../lib/types';
import { ShieldCheck } from 'lucide-react';

export function AuditTimeline({ events }: { events: AuditEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-neutral-500 bg-neutral-50 rounded-lg border border-neutral-200">
        No audit events recorded yet.
      </div>
    );
  }

  const getActionTitle = (event: AuditEvent) => {
    switch (event.action) {
      case 'CLIENT_CREATED':
        return 'Client created';
      case 'DOCUMENT_ADDED':
        return 'Document added to checklist';
      case 'DOCUMENT_UPLOADED':
        return event.metadata_json?.version
          ? `Version ${event.metadata_json.version} uploaded`
          : 'Initial document uploaded';
      case 'REVIEW_STARTED':
        return 'Review started';
      case 'CORRECTION_REQUESTED':
        return 'Correction requested';
      case 'DOCUMENT_REUPLOADED':
        return event.metadata_json?.version
          ? `Version ${event.metadata_json.version} uploaded`
          : 'Revised document uploaded';
      case 'DOCUMENT_APPROVED':
        return 'Document approved';
      default:
        return event.action.replace(/_/g, ' ').toLowerCase();
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[9px] before:w-[2px] before:bg-neutral-200">
      {events.map((event) => {
        const title = getActionTitle(event);
        const timeStr = new Date(event.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        const actorDisplay = event.actor_name
          ? `${event.actor_name}${event.actor_role ? ` · ${event.actor_role}` : ''}`
          : 'System';

        return (
          <div key={event.id} className="relative">
            <div className="absolute -left-[20px] top-1.5 h-2.5 w-2.5 rounded-full bg-neutral-900 ring-4 ring-white" />

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono text-neutral-500 text-xs">{timeStr}</span>
                <span className="text-neutral-300">·</span>
                <span className="font-semibold text-neutral-900">{title}</span>
              </div>

              <div className="text-xs text-neutral-500">
                {actorDisplay}
              </div>

              {event.comment && (
                <div className="mt-1.5 p-3 rounded-md bg-neutral-50 border border-neutral-200 text-sm text-neutral-800 italic">
                  &ldquo;{event.comment}&rdquo;
                </div>
              )}

              {event.metadata_json && Object.keys(event.metadata_json).length > 0 && (
                <details className="pt-1 text-xs text-neutral-400">
                  <summary className="cursor-pointer hover:text-neutral-700 select-none flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Audit metadata</span>
                  </summary>
                  <pre className="mt-1 p-2 rounded bg-neutral-50 border border-neutral-200 font-mono text-xs text-neutral-700 overflow-x-auto">
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
