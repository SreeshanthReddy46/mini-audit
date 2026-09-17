import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'pending' | 'uploaded' | 'review' | 'correction' | 'approved' | 'role';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs font-semibold';

  const variantClasses = {
    default: 'bg-neutral-100 text-black border-neutral-300',
    pending: 'bg-white text-neutral-500 border-neutral-300',
    uploaded: 'bg-neutral-100 text-black border-neutral-400 font-semibold',
    review: 'bg-neutral-200 text-black border-black font-semibold',
    correction: 'bg-white text-black border-dashed border-black font-bold',
    approved: 'bg-black text-white border-black font-bold',
    role: 'bg-black text-white border-black font-bold',
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase ${sizeClasses} ${variantClasses}`}
    >
      {children}
    </span>
  );
}
