import React from 'react';
import Link from 'next/link';
import { Document } from '../../lib/types';
import { DocumentStatus } from './DocumentStatus';
import { Button } from '../ui/Button';
import { CornerStars } from '../ui/CornerStars';
import { FileText, ArrowRight, AlertCircle, Clock } from 'lucide-react';

export function DocumentCard({ document }: { document: Document }) {
  const isPending = document.status === 'PENDING';
  const hasComment = document.status === 'CORRECTION_REQUIRED' && document.review_comment;

  return (
    <div className="group relative rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs hover:border-neutral-900 transition-all duration-200 hover-lift">
      <CornerStars />
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center text-white mt-0.5 transition-transform group-hover:scale-105 shadow-2xs">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-900">{document.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono font-bold text-neutral-600">v{document.version}</span>
              {document.uploaded_at ? (
                <span className="text-[11px] text-neutral-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3" />
                  {new Date(document.uploaded_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              ) : (
                <span className="text-[11px] text-neutral-400 font-medium">Awaiting initial upload</span>
              )}
            </div>
          </div>
        </div>

        <DocumentStatus status={document.status} />
      </div>

      {hasComment && (
        <div className="my-3 p-3 rounded-xl bg-neutral-50 border border-neutral-900 text-xs text-neutral-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Correction Requested:</span>
            <span className="font-medium italic">&ldquo;{document.review_comment}&rdquo;</span>
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
        <span className="text-xs text-neutral-500 font-medium">
          {document.uploader_name ? `Uploaded by ${document.uploader_name}` : 'Not uploaded yet'}
        </span>

        <Link href={`/documents/${document.id}`}>
          <Button variant="primary" size="sm" className="gap-1.5 group/btn rounded-xl">
            {isPending ? 'Upload File' : 'Open Review'}
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
