'use client';

import React, { useState } from 'react';
import { Document } from '../../lib/types';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { UploadDocument } from './UploadDocument';
import {
  CheckCircle2,
  AlertCircle,
  Play,
  FileCheck,
  ArrowUpCircle,
  Upload,
  Search,
  RefreshCw,
  ShieldCheck,
  History,
  Check,
} from 'lucide-react';

interface DocumentReviewProps {
  document: Document;
  onUpload: (file: File) => Promise<any>;
  onStartReview: () => Promise<any>;
  onRequestCorrection: (comment: string) => Promise<any>;
  onReupload: (file: File) => Promise<any>;
  onApprove: (comment?: string) => Promise<any>;
}

export function DocumentReview({
  document,
  onUpload,
  onStartReview,
  onRequestCorrection,
  onReupload,
  onApprove,
}: DocumentReviewProps) {
  const { user } = useAuth();
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionComment, setCorrectionComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReviewer = user?.role === 'REVIEWER';

  const handleStartReview = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await onStartReview();
    } catch (err: any) {
      setError(err.message || 'Failed to start review.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await onApprove('Document approved.');
    } catch (err: any) {
      setError(err.message || 'Failed to approve document.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionComment.trim()) {
      setError('Please enter a specific reason for the correction.');
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      await onRequestCorrection(correctionComment.trim());
      setIsCorrectionModalOpen(false);
      setCorrectionComment('');
    } catch (err: any) {
      setError(err.message || 'Failed to request correction.');
    } finally {
      setActionLoading(false);
    }
  };

  const stages = [
    {
      id: 'upload',
      label: 'Upload',
      isComplete: document.status !== 'PENDING',
      isActive: document.status === 'PENDING',
      icon: Upload,
    },
    {
      id: 'review',
      label: 'Review',
      isComplete: ['CORRECTION_REQUIRED', 'APPROVED'].includes(document.status),
      isActive: ['UPLOADED', 'UNDER_REVIEW'].includes(document.status),
      icon: Search,
    },
    {
      id: 'correction',
      label: 'Correction',
      isComplete: document.status === 'APPROVED' && document.version > 1,
      isActive: document.status === 'CORRECTION_REQUIRED',
      icon: AlertCircle,
    },
    {
      id: 'reupload',
      label: 'Re-upload',
      isComplete: document.version > 1,
      isActive: document.status === 'CORRECTION_REQUIRED',
      icon: RefreshCw,
    },
    {
      id: 'approve',
      label: 'Approve',
      isComplete: document.status === 'APPROVED',
      isActive: document.status === 'UNDER_REVIEW',
      icon: CheckCircle2,
    },
    {
      id: 'audit',
      label: 'Audit History',
      isComplete: true,
      isActive: false,
      icon: History,
    },
  ];

  return (
    <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xs space-y-6">
      <div className="pb-5 border-b border-neutral-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">
              Audit Review Lifecycle
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Current Persona: <span className="font-bold text-neutral-900">{user?.name}</span> ({user?.role})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-1 sm:gap-2 pt-2">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div key={stage.id} className="flex flex-col items-center text-center relative group/stage">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    stage.isComplete
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : stage.isActive
                      ? 'bg-neutral-100 text-neutral-900 border-2 border-neutral-900 ring-4 ring-neutral-100'
                      : 'bg-neutral-50 text-neutral-400 border border-neutral-200'
                  }`}
                >
                  {stage.isComplete ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold mt-1.5 truncate max-w-full tracking-tight ${
                    stage.isActive
                      ? 'text-neutral-900 font-black'
                      : stage.isComplete
                      ? 'text-neutral-800'
                      : 'text-neutral-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-900 text-xs text-neutral-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-neutral-900" />
          <span>{error}</span>
        </div>
      )}

      {document.status === 'PENDING' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 leading-relaxed font-medium">
            <span className="font-bold text-neutral-900">Step 1 — Upload Required:</span> Upload the initial {document.name} document to begin the CA compliance verification workflow.
          </div>
          <UploadDocument onUpload={onUpload} buttonText="Upload Document" />
        </div>
      )}

      {document.status === 'UPLOADED' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 font-medium">
            Document is uploaded (Version {document.version}).
            {isReviewer ? ' Ready for certified reviewer inspection.' : ' Awaiting reviewer to initiate review.'}
          </div>

          {isReviewer ? (
            <Button
              onClick={handleStartReview}
              loading={actionLoading}
              className="w-full gap-2 rounded-xl py-3"
              variant="primary"
            >
              <Play className="w-4 h-4" /> Begin Compliance Review
            </Button>
          ) : (
            <p className="text-xs text-neutral-500 italic text-center py-2">
              Staff role cannot initiate reviews. Switch to a Reviewer persona in the top header to proceed.
            </p>
          )}
        </div>
      )}

      {document.status === 'UNDER_REVIEW' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 flex items-start gap-2.5">
            <FileCheck className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-neutral-900 block">Step 2 — Review In Progress:</span>
              <span className="text-neutral-600">Reviewer is inspecting document compliance against verification rules.</span>
            </div>
          </div>

          {isReviewer ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsCorrectionModalOpen(true)}
                disabled={actionLoading}
                className="gap-2 rounded-xl py-2.5 text-xs font-bold"
              >
                <AlertCircle className="w-4 h-4 text-neutral-700" /> Request Correction
              </Button>
              <Button
                variant="primary"
                onClick={handleApprove}
                loading={actionLoading}
                className="gap-2 rounded-xl py-2.5 text-xs font-bold"
              >
                <CheckCircle2 className="w-4 h-4 text-white" /> Approve Document
              </Button>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 italic text-center py-2">
              Under review by chartered accountant. Staff will be notified if corrections are requested.
            </p>
          )}
        </div>
      )}

      {document.status === 'CORRECTION_REQUIRED' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-900 text-xs text-neutral-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-neutral-900">
              <AlertCircle className="w-4 h-4 text-neutral-900" />
              Correction Requested by Reviewer:
            </div>
            <p className="pl-5 italic font-medium text-neutral-800">&ldquo;{document.review_comment}&rdquo;</p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 mb-2">
              <ArrowUpCircle className="w-4 h-4 text-neutral-900" />
              Upload Corrected File (Generates Version {document.version + 1}):
            </div>
            <UploadDocument onUpload={onReupload} buttonText="Upload Corrected Document" isReupload={true} />
          </div>
        </div>
      )}

      {document.status === 'APPROVED' && (
        <div className="p-6 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-neutral-900">Document Verified & Approved</h4>
          <p className="text-xs text-neutral-600 max-w-md mx-auto">
            This document has satisfied compliance verification. Locked at Version {document.version}.
          </p>
        </div>
      )}

      <Modal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        title="Request Document Correction"
      >
        <form onSubmit={handleConfirmCorrection} className="space-y-4">
          <p className="text-xs text-neutral-600">
            Specify the required adjustments for staff to upload a revised version.
          </p>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 mb-1.5">
              Correction Reason (Mandatory)
            </label>
            <textarea
              rows={3}
              value={correctionComment}
              onChange={(e) => setCorrectionComment(e.target.value)}
              placeholder="e.g. Closing balance does not reconcile. Please upload certified statement."
              className="w-full rounded-xl border border-neutral-300 p-3 text-xs text-neutral-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCorrectionModalOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={actionLoading}
              disabled={!correctionComment.trim()}
              className="rounded-xl"
            >
              Submit Correction Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
