'use client';

import React, { useState } from 'react';
import { Document } from '../../lib/types';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { UploadDocument } from './UploadDocument';
import { CheckCircle2, AlertCircle, Play, FileCheck, ArrowUpCircle } from 'lucide-react';

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
  const isStaff = user?.role === 'STAFF';

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

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-black">Review & Workflow Actions</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Role: <span className="font-semibold text-black">{user?.role}</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-neutral-50 border border-black text-xs text-black flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-black" />
          {error}
        </div>
      )}

      {/* STATE 1: PENDING */}
      {document.status === 'PENDING' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-black">
            <span className="font-semibold">Document Required:</span> Upload initial {document.name} to begin compliance review.
          </div>
          <UploadDocument onUpload={onUpload} buttonText="Upload Initial Document" />
        </div>
      )}

      {/* STATE 2: UPLOADED */}
      {document.status === 'UPLOADED' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-black">
            Document is uploaded (version {document.version}).
            {isReviewer ? ' Ready for reviewer assessment.' : ' Awaiting reviewer to begin evaluation.'}
          </div>

          {isReviewer ? (
            <Button
              onClick={handleStartReview}
              loading={actionLoading}
              className="w-full gap-2"
              variant="primary"
            >
              <Play className="w-4 h-4" /> Start Review
            </Button>
          ) : (
            <p className="text-xs text-neutral-500 italic text-center">
              Staff cannot approve or review. Please switch to Reviewer persona to advance workflow.
            </p>
          )}
        </div>
      )}

      {/* STATE 3: UNDER_REVIEW */}
      {document.status === 'UNDER_REVIEW' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-black flex items-start gap-2">
            <FileCheck className="w-4 h-4 text-black shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Review In Progress:</span> Reviewer is evaluating document integrity.
            </div>
          </div>

          {isReviewer ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsCorrectionModalOpen(true)}
                disabled={actionLoading}
                className="gap-2"
              >
                <AlertCircle className="w-4 h-4" /> Request Correction
              </Button>
              <Button
                variant="primary"
                onClick={handleApprove}
                loading={actionLoading}
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve Document
              </Button>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 italic text-center">
              Under review by chartered accountant. Staff will be alerted if corrections are needed.
            </p>
          )}
        </div>
      )}

      {/* STATE 4: CORRECTION_REQUIRED */}
      {document.status === 'CORRECTION_REQUIRED' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-neutral-50 border border-black text-xs text-black space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-black">
              <AlertCircle className="w-4 h-4 text-black" />
              Correction Required by Reviewer:
            </div>
            <p className="pl-5 italic font-medium">&ldquo;{document.review_comment}&rdquo;</p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-black mb-2">
              <ArrowUpCircle className="w-4 h-4 text-black" />
              Upload Revised Document (Will generate version {document.version + 1}):
            </div>
            <UploadDocument onUpload={onReupload} buttonText="Re-upload Corrected File" isReupload={true} />
          </div>
        </div>
      )}

      {/* STATE 5: APPROVED */}
      {document.status === 'APPROVED' && (
        <div className="p-5 rounded-xl bg-white border-2 border-black text-black text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-black mx-auto" />
          <h4 className="text-sm font-bold">Document Approved & Compliant</h4>
          <p className="text-xs text-neutral-600">
            This document has successfully satisfied audit requirements. Final version: v{document.version}.
          </p>
        </div>
      )}

      {/* Correction Request Modal */}
      <Modal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        title="Request Document Correction"
      >
        <form onSubmit={handleConfirmCorrection} className="space-y-4">
          <p className="text-xs text-neutral-600">
            Specify the deficiency or missing information (e.g. <em>&ldquo;Page 3 is missing. Please upload the complete bank statement.&rdquo;</em>).
          </p>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-1.5">
              Correction Reason (Mandatory)
            </label>
            <textarea
              rows={3}
              value={correctionComment}
              onChange={(e) => setCorrectionComment(e.target.value)}
              placeholder="e.g. Page 3 is missing. Please upload the complete bank statement."
              className="w-full rounded-lg border border-neutral-300 p-3 text-xs text-black focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCorrectionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={actionLoading}
              disabled={!correctionComment.trim()}
            >
              Submit Correction Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
