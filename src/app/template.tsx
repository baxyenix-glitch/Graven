'use client';

import React from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in w-full">
      {children}
      <style jsx>{`
        .animate-fade-in {
          animation: pageFadeIn 150ms ease-out forwards;
        }
        @keyframes pageFadeIn {
          from {
            opacity: 0.85;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
