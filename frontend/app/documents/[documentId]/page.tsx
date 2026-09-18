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
import { DocumentVersion, AIAnalysis, Client } from '../../../lib/types';
import {
  Download,
  ExternalLink,
  FileText,
  AlertOctagon,
  ShieldCheck,
  Sparkles,
  Bot,
  Layers,
  Check,
  Copy,
  Info,
  Eye,
  X,
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

  const [client, setClient] = useState<Client | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [runningAi, setRunningAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

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

  const loadFileBlob = useCallback(async () => {
    if (!documentId) return;
    try {
      setPreviewLoading(true);
      const blob = await api.getFileBlob(`/api/documents/${documentId}/file`);
      const isPdf = currentDocument?.file_url ? currentDocument.file_url.toLowerCase().endsWith('.pdf') : true;
      const safeBlob = new Blob([blob], { type: isPdf ? 'application/pdf' : 'text/plain' });
      const url = window.URL.createObjectURL(safeBlob);
      setPreviewBlobUrl((prev) => {
        if (prev) window.URL.revokeObjectURL(prev);
        return url;
      });
    } catch {
      setPreviewBlobUrl(null);
    } finally {
      setPreviewLoading(false);
    }
  }, [documentId, currentDocument?.file_url]);

  useEffect(() => {
    async function load() {
      if (!documentId) return;
      const doc = await fetchDocumentDetail(documentId);
      if (doc) {
        fetchAuditHistory(documentId);
        fetchVersions();
        fetchAiAnalysis();
        try {
          const clientData = await api.get<Client>(`/api/clients/${doc.client_id}`);
          setClient(clientData);
        } catch {
          setClient(null);
        }
      }
    }
    load();
    return () => {
      if (previewBlobUrl) {
        window.URL.revokeObjectURL(previewBlobUrl);
      }
    };
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
      const ext = currentDocument.file_url.includes('.')
        ? currentDocument.file_url.substring(currentDocument.file_url.lastIndexOf('.'))
        : '.pdf';
      await api.downloadFile(
        `/api/documents/${documentId}/file?download=true`,
        `${currentDocument.name}_v${currentDocument.version}${ext}`
      );
    } catch (err) {
      alert('Failed to download file: ' + err);
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenNewTab = async () => {
    if (!currentDocument || !currentDocument.file_url) return;
    if (previewBlobUrl) {
      window.open(previewBlobUrl, '_blank');
      return;
    }
    try {
      setPreviewLoading(true);
      const blob = await api.getFileBlob(`/api/documents/${documentId}/file`);
      const url = window.URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
      window.open(url, '_blank');
    } catch {
      alert('Unable to open document preview.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  if (loading && !currentDocument) {
    return <Loading message="Loading audit document..." />;
  }

  if (error || !currentDocument) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 rounded-lg bg-white border border-neutral-200">
        <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center mx-auto mb-3 border border-neutral-200">
          <AlertOctagon className="w-6 h-6 text-neutral-800" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900">Document Not Found</h3>
        <p className="text-sm text-neutral-600 mt-1 mb-5">
          This document does not exist or does not belong to your authenticated firm. Access is strictly blocked.
        </p>
        <Link href="/dashboard">
          <Button variant="primary" size="md" className="rounded-md">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const latestVersion = versions.find((v) => v.version_number === currentDocument.version) || versions[0];
  const formattedUploadDate = currentDocument.uploaded_at
    ? new Date(currentDocument.uploaded_at).toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not uploaded yet';

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <nav className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
          <Link
            href="/clients"
            className="hover:text-neutral-900 transition-colors"
          >
            Clients
          </Link>
          <span>/</span>
          <Link
            href={`/clients/${currentDocument.client_id}`}
            className="hover:text-neutral-900 transition-colors"
          >
            {client?.name || 'Client Checklist'}
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-bold">{currentDocument.name}</span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-neutral-200">
          <div className="space-y-1.5">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
                {currentDocument.name}
              </h1>
              <DocumentStatus status={currentDocument.status} />
            </div>
            <p className="text-base text-neutral-500">
              Version {currentDocument.version} · Uploaded {formattedUploadDate}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentDocument.file_url && (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleOpenNewTab}
                  disabled={!previewBlobUrl}
                  className="gap-2 rounded-md font-medium"
                >
                  <ExternalLink className="w-4 h-4" /> Open Document
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleDownload}
                  loading={downloading}
                  className="gap-2 rounded-md font-semibold"
                >
                  <Download className="w-4 h-4" /> Download
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-8">
          <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden hover-card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/60">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-neutral-700" />
                <span className="text-base font-bold text-neutral-900">
                  Document Preview · {currentDocument.name} (v{currentDocument.version})
                </span>
              </div>
              <div className="flex items-center gap-3">
                {latestVersion && (
                  <span className="text-xs font-mono text-neutral-500">
                    {(latestVersion.file_size / 1024).toFixed(1)} KB
                  </span>
                )}
                {previewBlobUrl && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleOpenNewTab}
                      className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                      title="Open in new window"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (previewBlobUrl) window.URL.revokeObjectURL(previewBlobUrl);
                        setPreviewBlobUrl(null);
                      }}
                      className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                      title="Close preview"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="min-h-[500px] h-[880px] bg-neutral-100 flex flex-col justify-center items-center relative overflow-hidden">
              {previewLoading ? (
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto" />
                  <p className="text-base text-neutral-600">Loading document preview...</p>
                </div>
              ) : previewBlobUrl ? (
                <iframe
                  src={previewBlobUrl}
                  title="Document Preview"
                  className="w-full h-full border-0 bg-white"
                />
              ) : currentDocument.file_url ? (
                <div className="text-center p-8 max-w-md space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-center mx-auto text-neutral-700">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-lg font-bold text-neutral-900">{currentDocument.name}</h4>
                    <p className="text-sm text-neutral-500">
                      Version {currentDocument.version} · {latestVersion ? `${(latestVersion.file_size / 1024).toFixed(1)} KB` : 'Uploaded Document'}
                    </p>
                    {latestVersion?.sha256_hash && (
                      <p className="text-xs font-mono text-neutral-400 truncate max-w-xs mx-auto">
                        SHA-256: {latestVersion.sha256_hash.substring(0, 16)}...
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Button
                      onClick={loadFileBlob}
                      loading={previewLoading}
                      variant="primary"
                      className="gap-2 rounded-md font-semibold"
                    >
                      <Eye className="w-4 h-4" /> Preview Document
                    </Button>
                    <Button
                      onClick={handleDownload}
                      loading={downloading}
                      variant="outline"
                      className="gap-2 rounded-md font-semibold"
                    >
                      <Download className="w-4 h-4" /> Download
                    </Button>
                    <Button
                      onClick={handleOpenNewTab}
                      variant="outline"
                      className="gap-2 rounded-md font-semibold"
                    >
                      <ExternalLink className="w-4 h-4" /> Open in New Tab
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 max-w-sm space-y-2.5">
                  <FileText className="w-9 h-9 text-neutral-400 mx-auto" />
                  <h4 className="text-sm font-semibold text-neutral-900">No Document File Present</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Upload the initial document using the review panel on the right to start compliance inspection.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-7 space-y-5 hover-card">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-neutral-700" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
                  Immutable Version History
                </h3>
              </div>
              <span className="text-xs font-mono text-neutral-500">
                {versions.length} {versions.length === 1 ? 'version' : 'versions'}
              </span>
            </div>

            {loadingVersions ? (
              <p className="text-sm text-neutral-500 py-4 text-center">Loading versions...</p>
            ) : versions.length === 0 ? (
              <p className="text-sm text-neutral-500 py-4 text-center">No versions recorded yet.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {versions.map((v) => {
                  const isCurrent = v.version_number === currentDocument.version;
                  return (
                    <div key={v.id} className="py-3.5 px-2.5 rounded-lg hover:bg-neutral-50 transition-colors first:pt-2.5 last:pb-2.5 space-y-2 hover-lift-subtle">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base font-bold text-neutral-900">Version {v.version_number}</span>
                          {isCurrent && (
                            <span className="text-xs text-neutral-500 font-medium">
                              (Current)
                            </span>
                          )}
                          <span className="text-xs text-neutral-500 font-mono">({v.original_name})</span>
                        </div>
                        <span className="text-xs font-mono text-neutral-600">
                          {(v.file_size / 1024).toFixed(1)} KB
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <div className="flex items-center gap-2 font-mono">
                          <ShieldCheck className="w-4 h-4 text-neutral-600 shrink-0" />
                          <span>SHA-256:</span>
                          <code className="text-xs text-neutral-700">
                            {v.sha256_hash.slice(0, 10)}...{v.sha256_hash.slice(-8)}
                          </code>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyHash(v.sha256_hash)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                        >
                          {copiedHash === v.sha256_hash ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Copy Hash
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-xs text-neutral-400 flex items-center justify-between pt-0.5">
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
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-7 space-y-4 hover-card">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 pb-2 border-b border-neutral-100">
              Document Overview
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">Client</span>
                <span className="font-semibold text-base text-neutral-900 block mt-1 truncate">
                  {client?.name || 'Loading...'}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">Document Type</span>
                <span className="font-semibold text-base text-neutral-900 block mt-1 truncate">
                  {currentDocument.name}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">Uploaded By</span>
                <span className="font-semibold text-base text-neutral-900 block mt-1 truncate">
                  {currentDocument.uploader_name || 'Awaiting upload'}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">Current Version</span>
                <span className="font-semibold text-base text-neutral-900 block mt-1 font-mono">
                  v{currentDocument.version}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">Uploaded Date</span>
                <span className="font-semibold text-base text-neutral-900 block mt-1">
                  {currentDocument.uploaded_at
                    ? new Date(currentDocument.uploaded_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">File Size</span>
                <span className="font-semibold text-base text-neutral-900 block mt-1 font-mono">
                  {latestVersion ? `${(latestVersion.file_size / 1024).toFixed(1)} KB` : '—'}
                </span>
              </div>
            </div>
          </div>

          <DocumentReview
            document={currentDocument}
            onUpload={async (file) => {
              const res = await uploadFile(currentDocument.id, file);
              fetchVersions();
              loadFileBlob();
              return res;
            }}
            onStartReview={() => startReview(currentDocument.id)}
            onRequestCorrection={(comment) => requestCorrection(currentDocument.id, comment)}
            onReupload={async (file) => {
              const res = await reuploadFile(currentDocument.id, file);
              fetchVersions();
              loadFileBlob();
              return res;
            }}
            onApprove={(comment) => approveDocument(currentDocument.id, comment)}
          />

          <div className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-7 space-y-5 hover-card">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <Bot className="w-5 h-5 text-neutral-700" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
                  AI Review Assistance
                </h3>
              </div>
              {currentDocument.status !== 'PENDING' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRunAiAnalysis}
                  loading={runningAi}
                  className="gap-1.5 rounded-md"
                >
                  <Sparkles className="w-4 h-4 text-neutral-700" />
                  {aiAnalysis ? 'Re-scan' : 'Run Scan'}
                </Button>
              )}
            </div>

            {aiError && (
              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 flex items-center gap-3">
                <AlertOctagon className="w-5 h-5 shrink-0 text-neutral-700" />
                <span>{aiError}</span>
              </div>
            )}

            {currentDocument.status === 'PENDING' ? (
              <p className="text-sm text-neutral-500 italic py-2">
                Upload a document version before running automated review checks.
              </p>
            ) : aiAnalysis ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-neutral-900">Analysis Summary</span>
                    <span className="font-mono text-neutral-600 text-xs font-semibold">
                      Confidence: {(aiAnalysis.overall_confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    {aiAnalysis.summary}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">
                    Observations ({aiAnalysis.findings?.length || 0})
                  </span>
                  <div className="space-y-2.5">
                    {aiAnalysis.findings?.map((finding, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border border-neutral-200 bg-white space-y-1.5 hover-lift-subtle"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-neutral-900">{finding.category}</span>
                          <span className="font-mono text-xs text-neutral-500">
                            {finding.severity}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-800">
                          <span className="text-neutral-500 font-semibold">Observation: </span>
                          {finding.observation}
                        </p>
                        <p className="text-xs sm:text-sm text-neutral-600">
                          <span className="text-neutral-500 font-semibold">Recommendation: </span>
                          {finding.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                  <span>
                    Advisory only. Final approval requires certified human chartered accountant sign-off.
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-neutral-200 rounded-lg">
                <Bot className="w-8 h-8 text-neutral-400 mx-auto mb-2.5" />
                <p className="text-base font-semibold text-neutral-900">No Automated Scan Run</p>
                <p className="text-sm text-neutral-500 mt-1 max-w-xs mx-auto">
                  Click &ldquo;Run Scan&rdquo; to evaluate this document against standard audit rules.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-7 space-y-5 hover-card">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
                Audit Trail
              </h3>
              <span className="text-xs font-mono text-neutral-400">
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
