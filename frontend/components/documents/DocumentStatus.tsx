import React from 'react';
import { DocumentStatus as StatusType } from '../../lib/types';
import { Clock, Upload, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

export function DocumentStatus({ status }: { status: StatusType }) {
  const configs: Record<StatusType, { label: string; icon: any }> = {
    PENDING: { label: 'Pending Upload', icon: Clock },
    UPLOADED: { label: 'Uploaded', icon: Upload },
    UNDER_REVIEW: { label: 'Under Review', icon: Search },
    CORRECTION_REQUIRED: { label: 'Correction Required', icon: AlertCircle },
    APPROVED: { label: 'Approved', icon: CheckCircle2 },
  };

  const config = configs[status] || configs.PENDING;
  const Icon = config.icon;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-black">
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}
