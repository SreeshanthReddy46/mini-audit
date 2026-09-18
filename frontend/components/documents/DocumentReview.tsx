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
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
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

  const handleConfirmApprove = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await onApprove('Document approved.');
      setIsApproveModalOpen(false);
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
    },
    {
      id: 'review',
      label: 'Review',
      isComplete: ['CORRECTION_REQUIRED', 'APPROVED'].includes(document.status),
      isActive: ['UPLOADED', 'UNDER_REVIEW'].includes(document.status),
    },
    {
      id: 'correction',
      label: 'Correction',
      isComplete: document.status === 'APPROVED' && document.version > 1,
      isActive: document.status === 'CORRECTION_REQUIRED',
    },
    {
      id: 'reupload',
      label: 'Re-upload',
      isComplete: document.version > 1,
      isActive: document.status === 'CORRECTION_REQUIRED',
    },
    {
      id: 'approve',
      label: 'Approve',
      isComplete: document.status === 'APPROVED',
      isActive: document.status === 'UNDER_REVIEW',
    },
  ];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-7 space-y-5 hover-card">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            Review Workflow
          </h3>
          <p className="text-sm text-neutral-600 mt-1">
            Current Persona: <span className="font-bold text-neutral-900">{user?.name}</span> ({user?.role})
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 py-1 text-sm">
        {stages.map((stage, idx) => (
          <div key={stage.id} className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                stage.isComplete
                  ? 'bg-neutral-900'
                  : stage.isActive
                  ? 'bg-neutral-900 ring-2 ring-neutral-300'
                  : 'bg-neutral-300'
              }`}
            />
            <span
              className={`text-sm ${
                stage.isActive
                  ? 'text-neutral-900 font-bold'
                  : stage.isComplete
                  ? 'text-neutral-700 font-medium'
                  : 'text-neutral-400'
              }`}
            >
              {stage.label}
            </span>
            {idx < stages.length - 1 && (
              <span className="text-neutral-300 ml-1.5">/</span>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-neutral-700" />
          <span>{error}</span>
        </div>
      )}

      {document.status === 'PENDING' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-700 leading-relaxed">
            Upload the initial document file to start the statutory audit compliance review.
          </div>
          <UploadDocument onUpload={onUpload} buttonText="Upload Document" />
        </div>
      )}

      {document.status === 'UPLOADED' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-700 leading-relaxed">
            Document Version {document.version} uploaded.
            {isReviewer ? ' Ready for certified compliance inspection.' : ' Awaiting certified reviewer to initiate review.'}
          </div>

          {isReviewer ? (
            <Button
              onClick={handleStartReview}
              loading={actionLoading}
              className="w-full gap-2 rounded-md py-3 text-sm font-semibold"
              variant="primary"
            >
              <Play className="w-4 h-4" /> Start Compliance Review
            </Button>
          ) : (
            <p className="text-sm text-neutral-500 italic text-center py-1.5">
              Staff persona cannot initiate reviews. Switch to a Reviewer persona above to inspect.
            </p>
          )}
        </div>
      )}

      {document.status === 'UNDER_REVIEW' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-700 flex items-start gap-3">
            <FileCheck className="w-5 h-5 text-neutral-800 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-neutral-900 block">Inspection In Progress</span>
              <span className="text-neutral-600 mt-0.5 block">Certified reviewer is inspecting document integrity and statutory compliance.</span>
            </div>
          </div>

          {isReviewer ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <Button
                variant="outline"
                onClick={() => setIsCorrectionModalOpen(true)}
                disabled={actionLoading}
                className="gap-2 rounded-md py-2.5 text-sm font-semibold"
              >
                <AlertCircle className="w-4 h-4 text-neutral-600" /> Request Correction
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsApproveModalOpen(true)}
                disabled={actionLoading}
                className="gap-2 rounded-md py-2.5 text-sm font-semibold"
              >
                <CheckCircle2 className="w-4 h-4 text-white" /> Approve Document
              </Button>
            </div>
          ) : (
            <p className="text-sm text-neutral-500 italic text-center py-1.5">
              Under review by chartered accountant. Staff will be notified if corrections are required.
            </p>
          )}
        </div>
      )}

      {document.status === 'CORRECTION_REQUIRED' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-sm text-neutral-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-neutral-900">
              <AlertCircle className="w-4.5 h-4.5 text-neutral-700" />
              Correction Requested by Reviewer
            </div>
            <p className="pl-6 italic text-neutral-700">&ldquo;{document.review_comment}&rdquo;</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800 mb-2.5">
              <ArrowUpCircle className="w-4.5 h-4.5 text-neutral-700" />
              Upload Corrected File (Generates Version {document.version + 1}):
            </div>
            <UploadDocument onUpload={onReupload} buttonText="Upload Corrected Document" isReupload={true} />
          </div>
        </div>
      )}

      {document.status === 'APPROVED' && (
        <div className="p-6 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 text-center space-y-2">
          <CheckCircle2 className="w-7 h-7 text-neutral-800 mx-auto mb-1.5" />
          <h4 className="text-base font-bold text-neutral-900">Document Verified & Approved</h4>
          <p className="text-sm text-neutral-500">
            All statutory compliance rules satisfied. Record permanently locked at Version {document.version}.
          </p>
        </div>
      )}

      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve document?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 leading-relaxed">
            You are approving Version {document.version} of{' '}
            <strong className="font-semibold text-neutral-900">{document.name}</strong>.
            This action will be permanently recorded in the immutable audit trail.
          </p>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsApproveModalOpen(false)}
              className="rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={actionLoading}
              onClick={handleConfirmApprove}
              className="rounded-md"
            >
              Approve Document
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        title="Request correction"
        maxWidth="md"
      >
        <form onSubmit={handleConfirmCorrection} className="space-y-4">
          <p className="text-sm text-neutral-600">
            Specify the required adjustments for staff to upload a revised version.
          </p>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              Reason for Correction (Mandatory)
            </label>
            <textarea
              rows={3}
              value={correctionComment}
              onChange={(e) => setCorrectionComment(e.target.value)}
              placeholder="Explain what needs to be corrected..."
              className="w-full rounded-md border border-neutral-300 p-3 text-sm text-neutral-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCorrectionModalOpen(false)}
              className="rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={actionLoading}
              disabled={!correctionComment.trim()}
              className="rounded-md"
            >
              Request Correction
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
