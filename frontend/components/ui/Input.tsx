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
        <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-black placeholder-neutral-400 transition-colors focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:bg-neutral-100 disabled:text-neutral-500 ${
          error ? 'border-black focus:border-black focus:ring-black' : 'border-neutral-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-black font-semibold flex items-center gap-1">⚠ {error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-neutral-600">{helperText}</p>}
    </div>
  );
}
