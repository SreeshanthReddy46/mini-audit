import React from 'react';
import { DocumentStatus as StatusType } from '../../lib/types';
import { Badge } from '../ui/Badge';
import { Clock, Upload, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

export function DocumentStatus({ status }: { status: StatusType }) {
  const configs: Record<StatusType, { label: string; variant: any; icon: any }> = {
    PENDING: { label: 'Pending Upload', variant: 'pending', icon: Clock },
    UPLOADED: { label: 'Uploaded', variant: 'uploaded', icon: Upload },
    UNDER_REVIEW: { label: 'Under Review', variant: 'review', icon: Search },
    CORRECTION_REQUIRED: { label: 'Correction Required', variant: 'correction', icon: AlertCircle },
    APPROVED: { label: 'Approved', variant: 'approved', icon: CheckCircle2 },
  };

  const config = configs[status] || configs.PENDING;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} size="sm">
      <span className="flex items-center gap-1.5 font-semibold">
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    </Badge>
  );
}
