'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDocuments } from '../../../hooks/useDocuments';
import { useAuth } from '../../../hooks/useAuth';
import { DocumentStatus } from '../../../components/documents/DocumentStatus';
import { DocumentReview } from '../../../components/documents/DocumentReview';
import { AuditTimeline } from '../../../components/audit/AuditTimeline';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { CornerStars } from '../../../components/ui/CornerStars';
import { DocumentVersion, AIAnalysis } from '../../../lib/types';
import {
  ArrowLeft,
  Download,
  FileText,
  History,
  AlertOctagon,
  User,
  Clock,
  Bot,
  Layers,
  Sparkles,
  ShieldCheck,
  Info,
} from 'lucide-react';
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
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [runningAi, setRunningAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
    if (!documentId) return;
    try {
      setLoadingVersions(true);
      const data = await api.get<DocumentVersion[]>(`/api/documents/${documentId}/versions`);
      setVersions(data);
    } catch {
    } finally {
      setLoadingVersions(false);
    }
  }, [documentId]);

  const fetchAiAnalysis = useCallback(async () => {
    if (!documentId) return;
    try {
      const data = await api.get<AIAnalysis>(`/api/documents/${documentId}/analysis`);
      setAiAnalysis(data);
    } catch {
      setAiAnalysis(null);
    }
  }, [documentId]);

  useEffect(() => {
    async function load() {
      if (!documentId) return;
      const doc = await fetchDocumentDetail(documentId);
      if (doc) {
        fetchAuditHistory(documentId);
        fetchVersions();
        fetchAiAnalysis();
      }
    }
    load();
  }, [documentId, user?.firm_id, fetchDocumentDetail, fetchAuditHistory, fetchVersions, fetchAiAnalysis]);

  const handleRunAiAnalysis = async () => {
    setRunningAi(true);
    setAiError(null);
    try {
      const res = await api.post<AIAnalysis>(`/api/documents/${documentId}/analyze`);
      setAiAnalysis(res);
      await fetchAuditHistory(documentId);
    } catch (err: any) {
      setAiError(err.message || 'Failed to complete advisory analysis.');
    } finally {
      setRunningAi(false);
    }
  };

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
      <div className="group relative max-w-md mx-auto my-12 text-center p-8 rounded-2xl bg-white border-2 border-neutral-900 shadow-sm hover-lift">
        <CornerStars />
        <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center mx-auto mb-3 border border-neutral-200">
          <AlertOctagon className="w-6 h-6 text-neutral-900" />
        </div>
        <h3 className="text-base font-bold text-neutral-900">Tenant Document Not Found (404)</h3>
        <p className="text-xs text-neutral-600 mt-1 mb-4">
          This document does not exist or does not belong to your authenticated firm. Access is strictly blocked.
        </p>
        <Link href="/dashboard">
          <Button variant="primary" size="sm" className="rounded-xl">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/clients/${currentDocument.client_id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-800 hover:text-neutral-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Client Checklist
        </Link>
      </div>

      <div className="group relative rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs flex flex-wrap items-center justify-between gap-4 hover-lift">
        <CornerStars />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-900 flex items-center justify-center transition-transform group-hover:scale-105">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-neutral-900 tracking-tight">{currentDocument.name}</h2>
              <span className="font-mono text-xs font-bold text-neutral-600">v{currentDocument.version}</span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5 font-medium">
              Compliance Review Lifecycle • Version {currentDocument.version}
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
              className="gap-1.5 text-xs rounded-xl"
            >
              <Download className="w-3.5 h-3.5" /> Download / View File
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-neutral-200 bg-white text-xs shadow-xs">
        <div>
          <span className="text-[11px] text-neutral-500 uppercase font-semibold block">Uploaded By</span>
          <span className="font-bold text-neutral-900 flex items-center gap-1 mt-0.5">
            <User className="w-3.5 h-3.5 text-neutral-700" />
            {currentDocument.uploader_name || 'Awaiting initial upload'}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-neutral-500 uppercase font-semibold block">Uploaded Date</span>
          <span className="font-bold text-neutral-900 flex items-center gap-1 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-neutral-700" />
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
          <span className="text-[11px] text-neutral-500 uppercase font-semibold block">Current Version</span>
          <span className="font-bold text-neutral-900 mt-0.5 block">Version {currentDocument.version}</span>
        </div>
        <div>
          <span className="text-[11px] text-neutral-500 uppercase font-semibold block">Review Note</span>
          <span className="font-medium text-neutral-800 mt-0.5 block truncate">
            {currentDocument.review_comment || 'No active notes'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <DocumentReview
            document={currentDocument}
            onUpload={async (file) => {
              const res = await uploadFile(currentDocument.id, file);
              fetchVersions();
              return res;
            }}
            onStartReview={() => startReview(currentDocument.id)}
            onRequestCorrection={(comment) => requestCorrection(currentDocument.id, comment)}
            onReupload={async (file) => {
              const res = await reuploadFile(currentDocument.id, file);
              fetchVersions();
              return res;
            }}
            onApprove={(comment) => approveDocument(currentDocument.id, comment)}
          />

          <div className="group relative rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs space-y-5 hover-lift">
            <CornerStars />
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center transition-transform group-hover:scale-105">
                  <Bot className="w-4 h-4 text-neutral-900" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    AI Advisory Assistant
                    <span className="text-xs font-mono font-medium text-neutral-500">
                      (Advisory Only)
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Independent verification agent. The backend deterministically controls state.
                  </p>
                </div>
              </div>

              {currentDocument.status !== 'PENDING' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRunAiAnalysis}
                  loading={runningAi}
                  className="gap-1.5 text-xs rounded-xl"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {aiAnalysis ? 'Re-run Advisory Check' : 'Run Advisory Analysis'}
                </Button>
              )}
            </div>

            {aiError && (
              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-900 text-xs text-neutral-900 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0 text-neutral-900" />
                <span>{aiError}</span>
              </div>
            )}

            {currentDocument.status === 'PENDING' ? (
              <p className="text-xs text-neutral-500 italic">
                Upload a document version before triggering AI advisory analysis.
              </p>
            ) : aiAnalysis ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-neutral-900" />
                      Automated Compliance Scanner
                    </span>
                    <span className="font-mono text-neutral-900 font-bold">
                      Confidence: {(aiAnalysis.overall_confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                    {aiAnalysis.summary}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    Advisory Findings ({aiAnalysis.findings?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {aiAnalysis.findings?.map((finding, idx) => (
                      <div
                        key={idx}
                        className="group/finding relative p-3.5 rounded-xl border border-neutral-200 bg-white space-y-1.5 hover:border-neutral-900 transition-colors"
                      >
                        <CornerStars size="sm" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-900">{finding.category}</span>
                          <span className="text-xs font-mono font-bold text-neutral-900">
                            {finding.severity}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-900">
                          <span className="font-semibold">Observation: </span>
                          {finding.observation}
                        </p>
                        <p className="text-xs text-neutral-600">
                          <span className="font-semibold text-neutral-900">Recommendation: </span>
                          {finding.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 flex items-center gap-2">
                  <Info className="w-4 h-4 text-neutral-900 shrink-0" />
                  <span>
                    <strong>Rule:</strong> AI findings are advisory only. A certified human reviewer must make final approval decisions.
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-neutral-200 rounded-xl">
                <Bot className="w-8 h-8 text-neutral-400 mx-auto mb-2 animate-float-slow" />
                <p className="text-xs font-semibold text-neutral-900">No Advisory Analysis Run Yet</p>
                <p className="text-[11px] text-neutral-500 mt-1 max-w-sm mx-auto">
                  Click &ldquo;Run Advisory Analysis&rdquo; to prompt the sandboxed compliance engine to inspect this document against compliance heuristics.
                </p>
              </div>
            )}
          </div>

          <div className="group relative rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4 hover-lift">
            <CornerStars />
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-neutral-900" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                  Immutable Version History
                </h3>
              </div>
              <span className="text-xs font-mono font-semibold text-neutral-600">
                {versions.length} {versions.length === 1 ? 'Version' : 'Versions'}
              </span>
            </div>

            {loadingVersions ? (
              <p className="text-xs text-neutral-500 py-4 text-center">Loading versions...</p>
            ) : versions.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4 text-center">No versions uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {versions.map((v) => (
                  <div
                    key={v.id}
                    className="group/version relative p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/70 hover:border-neutral-900 transition-colors space-y-2"
                  >
                    <CornerStars size="sm" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">Version {v.version_number}</span>
                        <span className="text-[11px] text-neutral-500 font-mono">({v.original_name})</span>
                      </div>
                      <span className="text-[11px] font-mono text-neutral-900 font-semibold">
                        {(v.file_size / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-600">
                      <div className="flex items-center gap-1.5 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-neutral-900">Fingerprint:</span>
                        <code className="font-mono text-[10px] text-neutral-700">
                          {v.sha256_hash.slice(0, 8)}...{v.sha256_hash.slice(-6)}
                        </code>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(v.sha256_hash)}
                        title="Copy full SHA-256 digest"
                        className="text-[10px] font-bold text-neutral-600 hover:text-neutral-900 underline"
                      >
                        Copy SHA-256
                      </button>
                    </div>

                    <div className="text-[10px] text-neutral-500 flex items-center justify-between pt-1.5 border-t border-neutral-200/80">
                      <span>Uploaded by: {v.uploader_name || 'Staff'}</span>
                      <span>
                        {new Date(v.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="group relative rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs hover-lift">
            <CornerStars />
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <History className="w-4 h-4 text-neutral-900" />
                Audit History
              </h3>
              <span className="text-xs font-mono font-semibold text-neutral-600">
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
