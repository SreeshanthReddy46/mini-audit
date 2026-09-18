import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = '', id, ...props }: InputProps) {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-md border bg-white px-4 py-2.5 text-base sm:text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:bg-neutral-100 disabled:text-neutral-500 ${
          error ? 'border-neutral-900 focus:border-neutral-900 focus:ring-neutral-900' : 'border-neutral-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-neutral-900 font-medium">⚠ {error}</p>}
      {helperText && !error && <p className="mt-1.5 text-xs text-neutral-500">{helperText}</p>}
    </div>
  );
}
