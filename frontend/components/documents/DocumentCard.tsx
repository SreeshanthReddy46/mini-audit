import React from 'react';
import Link from 'next/link';
import { Document } from '../../lib/types';
import { DocumentStatus } from './DocumentStatus';
import { Button } from '../ui/Button';
import { FileText, ArrowRight, AlertCircle, Clock } from 'lucide-react';

export function DocumentCard({ document }: { document: Document }) {
  const isPending = document.status === 'PENDING';
  const hasComment = document.status === 'CORRECTION_REQUIRED' && document.review_comment;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 space-y-4 hover-card">
      <div className="flex items-start justify-between gap-3.5">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900 mt-0.5 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-neutral-900 leading-snug">{document.name}</h4>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-xs font-mono text-neutral-500">v{document.version}</span>
              {document.uploaded_at ? (
                <span className="text-xs sm:text-sm text-neutral-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(document.uploaded_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              ) : (
                <span className="text-xs sm:text-sm text-neutral-400">Awaiting upload</span>
              )}
            </div>
          </div>
        </div>

        <DocumentStatus status={document.status} />
      </div>

      {hasComment && (
        <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-800 flex items-start gap-2.5">
          <AlertCircle className="w-4.5 h-4.5 text-neutral-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block text-xs uppercase tracking-wider text-neutral-900">Correction Requested:</span>
            <span className="italic text-neutral-700">&ldquo;{document.review_comment}&rdquo;</span>
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
        <span className="text-xs sm:text-sm text-neutral-500">
          {document.uploader_name ? `Uploaded by ${document.uploader_name}` : 'Not uploaded'}
        </span>

        <Link href={`/documents/${document.id}`}>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-md">
            {isPending ? 'Upload' : 'Review'}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
