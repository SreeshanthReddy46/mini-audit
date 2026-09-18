import React from 'react';
import { DocumentStatus as StatusType } from '../../lib/types';

interface DocumentStatusProps {
  status: StatusType;
  className?: string;
}

export function DocumentStatus({ status, className = '' }: DocumentStatusProps) {
  const configs: Record<StatusType, { label: string; dotColor: string; text: string }> = {
    PENDING: {
      label: 'Pending',
      dotColor: 'bg-neutral-400',
      text: 'text-neutral-500',
    },
    UPLOADED: {
      label: 'Uploaded',
      dotColor: 'bg-blue-500',
      text: 'text-neutral-700',
    },
    UNDER_REVIEW: {
      label: 'Under review',
      dotColor: 'bg-amber-500',
      text: 'text-neutral-700',
    },
    CORRECTION_REQUIRED: {
      label: 'Correction required',
      dotColor: 'bg-rose-500',
      text: 'text-neutral-700',
    },
    APPROVED: {
      label: 'Approved',
      dotColor: 'bg-emerald-500',
      text: 'text-neutral-700',
    },
  };

  const config = configs[status] || configs.PENDING;

  return (
    <span className={`inline-flex items-center gap-2 text-sm font-medium ${config.text} ${className}`}>
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
      <span>{config.label}</span>
    </span>
  );
}
