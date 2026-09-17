'use client';

import React, { useState } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

interface WaveRipple {
  id: number;
  x: number;
  y: number;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  onClick,
  onPointerDown,
  ...props
}: ButtonProps) {
  const [waves, setWaves] = useState<WaveRipple[]>([]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newWaveId = Date.now() + Math.random();

    setWaves((prev) => [...prev, { id: newWaveId, x, y }]);

    // Auto-clean wave after animation concludes
    setTimeout(() => {
      setWaves((prev) => prev.filter((w) => w.id !== newWaveId));
    }, 850);

    if (onPointerDown) {
      onPointerDown(e);
    }
  };

  const baseClasses =
    'relative inline-flex items-center justify-center font-semibold rounded-lg overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-md active:translate-y-0 active:scale-[0.98] hover-light-sweep';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }[size];

  // User specification: Black buttons across total website
  const variantClasses = {
    primary: 'bg-black text-white hover:bg-neutral-800 active:bg-neutral-900 focus:ring-black shadow-xs',
    secondary: 'bg-neutral-100 text-black border border-neutral-300 hover:bg-neutral-200 focus:ring-black',
    success: 'bg-black text-white hover:bg-neutral-800 focus:ring-black shadow-xs',
    warning: 'bg-black text-white hover:bg-neutral-800 focus:ring-black shadow-xs',
    danger: 'bg-black text-white hover:bg-neutral-900 border border-black focus:ring-black',
    outline: 'border border-black bg-white text-black hover:bg-neutral-100 focus:ring-black',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      onPointerDown={handlePointerDown}
      onClick={onClick}
      {...props}
    >
      {/* Ocean Waves Click Effect Overlay */}
      <span className="ocean-wave-container" aria-hidden="true">
        {waves.map((wave) => (
          <React.Fragment key={wave.id}>
            {/* Outer Deep Blue Ocean Wave */}
            <span
              className="ocean-wave-ring ocean-wave-1"
              style={{ left: wave.x, top: wave.y }}
            />
            {/* Mid Azure Ocean Wave */}
            <span
              className="ocean-wave-ring ocean-wave-2"
              style={{ left: wave.x, top: wave.y }}
            />
            {/* Inner Foam Blue Wave */}
            <span
              className="ocean-wave-ring ocean-wave-3"
              style={{ left: wave.x, top: wave.y }}
            />
          </React.Fragment>
        ))}
      </span>

      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current shrink-0"
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

      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
