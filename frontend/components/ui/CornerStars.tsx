'use client';

import React, { useId } from 'react';

interface CornerStarsProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CornerStars({ className = '', size = 'md' }: CornerStarsProps) {
  const idPrefix = useId().replace(/:/g, '');

  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  return (
    <>
      <span
        className={`corner-star corner-star-tl corner-star-glow-tl ${className}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className={`${sizeMap} overflow-visible`}>
          <defs>
            <linearGradient id={`${idPrefix}-grad-tl`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF007A" />
              <stop offset="50%" stopColor="#FF6000" />
              <stop offset="100%" stopColor="#FFD600" />
            </linearGradient>
            <linearGradient id={`${idPrefix}-glow-tl`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FFE066" />
            </linearGradient>
          </defs>
          <path
            d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z"
            fill={`url(#${idPrefix}-grad-tl)`}
          />
          <path
            d="M12 5L13.4 10.6L19 12L13.4 13.4L12 19L10.6 13.4L5 12L10.6 10.6L12 5Z"
            fill={`url(#${idPrefix}-glow-tl)`}
            opacity="0.85"
          />
          <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
        </svg>
      </span>

      <span
        className={`corner-star corner-star-tr corner-star-glow-tr ${className}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className={`${sizeMap} overflow-visible`}>
          <defs>
            <linearGradient id={`${idPrefix}-grad-tr`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7928CA" />
              <stop offset="45%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#00F2FE" />
            </linearGradient>
            <linearGradient id={`${idPrefix}-glow-tr`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#A5F3FC" />
            </linearGradient>
          </defs>
          <path
            d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z"
            fill={`url(#${idPrefix}-grad-tr)`}
          />
          <path
            d="M12 5L13.4 10.6L19 12L13.4 13.4L12 19L10.6 13.4L5 12L10.6 10.6L12 5Z"
            fill={`url(#${idPrefix}-glow-tr)`}
            opacity="0.85"
          />
          <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
        </svg>
      </span>

      <span
        className={`corner-star corner-star-br corner-star-glow-br ${className}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className={`${sizeMap} overflow-visible`}>
          <defs>
            <linearGradient id={`${idPrefix}-grad-br`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F5A0" />
              <stop offset="50%" stopColor="#00D9F5" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id={`${idPrefix}-glow-br`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#A7F3D0" />
            </linearGradient>
          </defs>
          <path
            d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z"
            fill={`url(#${idPrefix}-grad-br)`}
          />
          <path
            d="M12 5L13.4 10.6L19 12L13.4 13.4L12 19L10.6 13.4L5 12L10.6 10.6L12 5Z"
            fill={`url(#${idPrefix}-glow-br)`}
            opacity="0.85"
          />
          <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
        </svg>
      </span>

      <span
        className={`corner-star corner-star-bl corner-star-glow-bl ${className}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className={`${sizeMap} overflow-visible`}>
          <defs>
            <linearGradient id={`${idPrefix}-grad-bl`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF1361" />
              <stop offset="50%" stopColor="#FFF800" />
              <stop offset="100%" stopColor="#F53803" />
            </linearGradient>
            <linearGradient id={`${idPrefix}-glow-bl`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FECDD3" />
            </linearGradient>
          </defs>
          <path
            d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z"
            fill={`url(#${idPrefix}-grad-bl)`}
          />
          <path
            d="M12 5L13.4 10.6L19 12L13.4 13.4L12 19L10.6 13.4L5 12L10.6 10.6L12 5Z"
            fill={`url(#${idPrefix}-glow-bl)`}
            opacity="0.85"
          />
          <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
        </svg>
      </span>
    </>
  );
}
