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
    <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-xs hover:border-black transition-all">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center text-white mt-0.5">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-black">{document.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge size="sm">v{document.version}</Badge>
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
        <div className="my-3 p-3 rounded-lg bg-neutral-100 border-2 border-black text-xs text-black flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-black shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Correction Requested:</span>
            <span className="font-medium">{document.review_comment}</span>
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between">
        <span className="text-xs text-neutral-600 font-medium">
          {document.uploader_name ? `Uploaded by ${document.uploader_name}` : 'Not uploaded'}
        </span>

        <Link href={`/documents/${document.id}`}>
          <Button variant="primary" size="sm" className="gap-1.5">
            {isPending ? 'Upload File' : 'Open Review'}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
