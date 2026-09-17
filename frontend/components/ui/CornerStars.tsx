'use client';

import React from 'react';

interface CornerStarsProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CornerStars({ className = '', size = 'md' }: CornerStarsProps) {
  const sizeMap = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  const StarSvg = () => (
    <svg
      viewBox="0 0 24 24"
      className={`${sizeMap} fill-black text-black drop-shadow-sm`}
    >
      <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
    </svg>
  );

  return (
    <>
      {/* Top-Left Corner Star */}
      <span
        className={`corner-star corner-star-tl ${className}`}
        aria-hidden="true"
      >
        <StarSvg />
      </span>

      {/* Top-Right Corner Star */}
      <span
        className={`corner-star corner-star-tr ${className}`}
        aria-hidden="true"
      >
        <StarSvg />
      </span>

      {/* Bottom-Right Corner Star */}
      <span
        className={`corner-star corner-star-br ${className}`}
        aria-hidden="true"
      >
        <StarSvg />
      </span>

      {/* Bottom-Left Corner Star */}
      <span
        className={`corner-star corner-star-bl ${className}`}
        aria-hidden="true"
      >
        <StarSvg />
      </span>
    </>
  );
}
