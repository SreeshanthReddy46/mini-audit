'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
  Hash,
  AlertTriangle,
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
      // ignore
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
    if (documentId) {
      fetchDocumentDetail(documentId);
      fetchAuditHistory(documentId);
      fetchVersions();
      fetchAiAnalysis();
    }
  }, [documentId, fetchDocumentDetail, fetchAuditHistory, fetchVersions, fetchAiAnalysis]);

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
      <div className="max-w-md mx-auto my-12 text-center p-8 rounded-2xl bg-white border border-black shadow-sm">
        <div className="w-12 h-12 rounded-full bg-neutral-100 text-black flex items-center justify-center mx-auto mb-3 border border-neutral-200">
          <AlertOctagon className="w-6 h-6 text-black" />
        </div>
        <h3 className="text-base font-bold text-black">Tenant Document Not Found (404)</h3>
        <p className="text-xs text-neutral-600 mt-1 mb-4">
          This document does not belong to your authenticated firm. Access is strictly blocked.
        </p>
        <Link href="/dashboard">
          <Button variant="primary" size="sm">
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-black hover:underline transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-black" /> Back to Client Checklist
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 text-black flex items-center justify-center">
            <FileText className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-black tracking-tight">{currentDocument.name}</h2>
              <Badge size="sm">v{currentDocument.version}</Badge>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Document ID: <code className="font-mono text-black font-semibold">{currentDocument.id}</code>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-neutral-200 bg-white text-xs">
        <div>
          <span className="text-[11px] text-neutral-500 uppercase font-semibold block">Uploaded By</span>
          <span className="font-bold text-black flex items-center gap-1 mt-0.5">
            <User className="w-3.5 h-3.5 text-black" />
            {currentDocument.uploader_name || 'Awaiting upload'}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-neutral-500 uppercase font-semibold block">Uploaded Date</span>
          <span className="font-bold text-black flex items-center gap-1 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-black" />
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
          <span className="font-bold text-black mt-0.5 block">Version {currentDocument.version}</span>
        </div>
        <div>
          <span className="text-[11px] text-neutral-500 uppercase font-semibold block">Review Comment</span>
          <span className="font-medium text-black mt-0.5 block truncate">
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

          {/* AI Advisory Assistant Panel */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2">
                    AI Advisory Assistant
                    <span className="text-[10px] font-mono font-bold bg-neutral-100 text-black px-2 py-0.5 rounded border border-neutral-200">
                      Advisory Only
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
                  className="gap-1.5 text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {aiAnalysis ? 'Re-run Advisory Check' : 'Run Advisory Analysis'}
                </Button>
              )}
            </div>

            {aiError && (
              <div className="p-3 rounded-lg bg-neutral-50 border border-black text-xs text-black flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0 text-black" />
                <span>{aiError}</span>
              </div>
            )}

            {currentDocument.status === 'PENDING' ? (
              <p className="text-xs text-neutral-500 italic">
                Upload a document version before triggering AI advisory analysis.
              </p>
            ) : aiAnalysis ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-black flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-black" />
                      Model: <code className="font-mono">{aiAnalysis.model}</code> ({aiAnalysis.prompt_version})
                    </span>
                    <span className="font-mono text-black font-bold">
                      Confidence: {(aiAnalysis.overall_confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                    {aiAnalysis.summary}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                    Advisory Findings ({aiAnalysis.findings?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {aiAnalysis.findings?.map((finding, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-neutral-200 bg-white space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-black">{finding.category}</span>
                          <span
                            className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                              finding.severity === 'HIGH'
                                ? 'bg-neutral-900 text-white border-black'
                                : finding.severity === 'MEDIUM'
                                ? 'bg-neutral-200 text-black border-neutral-400'
                                : 'bg-neutral-100 text-black border-neutral-300'
                            }`}
                          >
                            {finding.severity}
                          </span>
                        </div>
                        <p className="text-xs text-black">
                          <span className="font-semibold">Observation: </span>
                          {finding.observation}
                        </p>
                        <p className="text-xs text-neutral-600">
                          <span className="font-semibold text-black">Recommendation: </span>
                          {finding.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600 flex items-center gap-2">
                  <Info className="w-4 h-4 text-black shrink-0" />
                  <span>
                    <strong>Rule:</strong> AI findings are advisory only. A certified human reviewer must make final approval decisions.
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-neutral-300 rounded-xl">
                <Bot className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-black">No Advisory Analysis Run Yet</p>
                <p className="text-[11px] text-neutral-500 mt-1 max-w-sm mx-auto">
                  Click &ldquo;Run Advisory Analysis&rdquo; to prompt the sandboxed LLM agent to inspect this document against compliance heuristics.
                </p>
              </div>
            )}
          </div>

          {/* Immutable Version History */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-black" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                  Immutable Version History
                </h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-black bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
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
                    className="p-3 rounded-lg border border-neutral-200 bg-neutral-50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-black">Version {v.version_number}</span>
                        <span className="text-[11px] text-neutral-500 font-mono">({v.original_name})</span>
                      </div>
                      <span className="text-[11px] font-mono text-black font-semibold">
                        {(v.file_size / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-600">
                      <Hash className="w-3.5 h-3.5 text-black shrink-0" />
                      <span className="font-semibold text-black">SHA-256:</span>
                      <code className="font-mono text-[10px] text-black break-all select-all">
                        {v.sha256_hash}
                      </code>
                    </div>

                    <div className="text-[10px] text-neutral-500 flex items-center justify-between pt-1 border-t border-neutral-200">
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

        {/* Right Column: Append-Only Audit History */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2">
                <History className="w-4 h-4 text-black" />
                Audit History
              </h3>
              <span className="text-[10px] uppercase font-bold text-black bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
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
