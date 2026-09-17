import React from 'react';
import Link from 'next/link';
import { Document } from '../../lib/types';
import { DocumentStatus } from './DocumentStatus';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { FileText, ArrowRight, AlertCircle, Clock } from 'lucide-react';

export function DocumentCard({ document }: { document: Document }) {
  const isPending = document.status === 'PENDING';
  const hasComment = document.status === 'CORRECTION_REQUIRED' && document.review_comment;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 mt-0.5">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{document.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge size="sm">v{document.version}</Badge>
              {document.uploaded_at ? (
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(document.uploaded_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">Awaiting initial upload</span>
              )}
            </div>
          </div>
        </div>

        <DocumentStatus status={document.status} />
      </div>

      {hasComment && (
        <div className="my-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Correction Requested:</span>
            <span>{document.review_comment}</span>
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {document.uploader_name ? `Uploaded by ${document.uploader_name}` : 'Not uploaded'}
        </span>

        <Link href={`/documents/${document.id}`}>
          <Button variant={isPending ? 'primary' : 'outline'} size="sm" className="gap-1.5">
            {isPending ? 'Upload' : 'Open Review'}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
