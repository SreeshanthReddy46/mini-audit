'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDocuments } from '../../../hooks/useDocuments';
import { useAuth } from '../../../hooks/useAuth';
import { DocumentStatus } from '../../../components/documents/DocumentStatus';
import { DocumentReview } from '../../../components/documents/DocumentReview';
import { AuditTimeline } from '../../../components/audit/AuditTimeline';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { ArrowLeft, Download, FileText, History, AlertOctagon, User, Clock } from 'lucide-react';
import { api } from '../../../lib/api';

export default function DocumentReviewPage() {
  const params = useParams();
  const documentId = params.documentId as string;
  const { user } = useAuth();

  const {
    currentDocument,
    auditHistory,
    loading,
    error,
    fetchDocumentDetail,
    fetchAuditHistory,
    uploadFile,
    startReview,
    requestCorrection,
    reuploadFile,
    approveDocument,
  } = useDocuments();

  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (documentId) {
      fetchDocumentDetail(documentId);
      fetchAuditHistory(documentId);
    }
  }, [documentId, fetchDocumentDetail, fetchAuditHistory]);

  const handleDownload = async () => {
    if (!currentDocument || !currentDocument.file_url) return;
    setDownloading(true);
    try {
      await api.downloadFile(
        `/api/documents/${documentId}/file`,
        `${currentDocument.name}_v${currentDocument.version}.pdf`
      );
    } catch (err) {
      alert('Failed to stream file: ' + err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading && !currentDocument) {
    return <Loading message="Loading audit document..." />;
  }

  if (error || !currentDocument) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 rounded-2xl bg-white border border-rose-200 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Tenant Document Not Found (404)</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          This document does not belong to your authenticated firm. Access is strictly blocked.
        </p>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top back navigation */}
      <div>
        <Link
          href={`/clients/${currentDocument.client_id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Client Checklist
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{currentDocument.name}</h2>
              <Badge size="sm">v{currentDocument.version}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Document ID: <code className="font-mono">{currentDocument.id}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DocumentStatus status={currentDocument.status} />

          {currentDocument.file_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              loading={downloading}
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" /> Download / View File
            </Button>
          )}
        </div>
      </div>

      {/* Metadata Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-200 bg-white text-xs">
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Uploaded By</span>
          <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            {currentDocument.uploader_name || 'Awaiting upload'}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Uploaded Date</span>
          <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {currentDocument.uploaded_at
              ? new Date(currentDocument.uploaded_at).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—'}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Current Version</span>
          <span className="font-bold text-slate-800 mt-0.5 block">Version {currentDocument.version}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Review Comment</span>
          <span className="font-medium text-slate-700 mt-0.5 block truncate">
            {currentDocument.review_comment || 'No active notes'}
          </span>
        </div>
      </div>

      {/* 2-Column Split: Actions (Left 55%) vs Audit History (Right 45%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Workflow Actions */}
        <div className="lg:col-span-7 space-y-6">
          <DocumentReview
            document={currentDocument}
            onUpload={(file) => uploadFile(currentDocument.id, file)}
            onStartReview={() => startReview(currentDocument.id)}
            onRequestCorrection={(comment) => requestCorrection(currentDocument.id, comment)}
            onReupload={(file) => reuploadFile(currentDocument.id, file)}
            onApprove={(comment) => approveDocument(currentDocument.id, comment)}
          />
        </div>

        {/* Right Column: Append-Only Audit History */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                Audit History
              </h3>
              <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Append-Only
              </span>
            </div>

            <AuditTimeline events={auditHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}
