import React from 'react';

export function Loading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-3 text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
}
