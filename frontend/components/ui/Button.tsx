'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'relative inline-flex items-center justify-center whitespace-nowrap font-medium rounded-md transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none hover:-translate-y-0.5 hover:shadow-xs active:translate-y-0 active:scale-[0.98]';

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-9 px-3.5 text-sm gap-2',
    lg: 'h-10 px-4 text-sm gap-2',
  }[size];

  const variantClasses = {
    primary: 'bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-950 focus:ring-neutral-800 shadow-2xs',
    secondary: 'bg-neutral-100 text-neutral-900 border border-neutral-200 hover:bg-neutral-200 hover:border-neutral-300 focus:ring-neutral-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 focus:ring-emerald-600 shadow-2xs',
    warning: 'bg-amber-600 text-white hover:bg-amber-500 active:bg-amber-700 focus:ring-amber-600 shadow-2xs',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 focus:ring-rose-600 shadow-2xs',
    outline: 'border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 hover:text-neutral-950 focus:ring-neutral-700',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}

      <span className="inline-flex items-center justify-center gap-1.5">
        {children}
      </span>
    </button>
  );
}
