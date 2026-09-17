import React from 'react';
import { AuditEvent } from '../../lib/types';
import { CheckCircle2, Clock, Upload, Search, AlertCircle, FilePlus, User } from 'lucide-react';

export function AuditTimeline({ events }: { events: AuditEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-neutral-500 bg-neutral-50 rounded-xl border border-dashed border-neutral-300 font-medium">
        No audit events recorded yet.
      </div>
    );
  }

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'CLIENT_CREATED':
        return { label: 'Client Created', icon: FilePlus };
      case 'DOCUMENT_ADDED':
        return { label: 'Document Added to Checklist', icon: FilePlus };
      case 'DOCUMENT_UPLOADED':
        return { label: 'Uploaded Document', icon: Upload };
      case 'REVIEW_STARTED':
        return { label: 'Started Review', icon: Search };
      case 'CORRECTION_REQUESTED':
        return { label: 'Requested Correction', icon: AlertCircle };
      case 'DOCUMENT_REUPLOADED':
        return { label: 'Uploaded Revised Document', icon: Upload };
      case 'DOCUMENT_APPROVED':
        return { label: 'Approved Document', icon: CheckCircle2 };
      default:
        return { label: action, icon: Clock };
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-neutral-300">
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
            <div className="absolute -left-[27px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-white text-black shadow-xs">
              <Icon className="h-3 w-3" />
            </div>

            <div className="bg-white rounded-lg border border-neutral-300 p-3.5 shadow-2xs hover:border-black transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-black">
                  <span>{config.label}</span>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {dateStr} • {timeStr}
                </span>
              </div>

              {event.comment && (
                <div className="mt-2 p-2.5 rounded-md bg-neutral-100 border border-neutral-200 text-xs text-black font-medium">
                  {event.comment}
                </div>
              )}

              <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
                <User className="w-3 h-3 text-black" />
                <span>{event.actor_name || 'System Operator'}</span>
                {event.metadata_json && event.metadata_json.version && (
                  <>
                    <span>•</span>
                    <span className="font-mono font-bold text-black">v{event.metadata_json.version}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
