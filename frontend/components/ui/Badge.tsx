import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'pending' | 'uploaded' | 'review' | 'correction' | 'approved' | 'role';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    pending: 'bg-slate-100 text-slate-600 border-slate-200',
    uploaded: 'bg-blue-50 text-blue-700 border-blue-200',
    review: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    correction: 'bg-amber-50 text-amber-800 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    role: 'bg-slate-900 text-slate-100 border-slate-800',
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase ${sizeClasses} ${variantClasses}`}
    >
      {children}
    </span>
  );
}
