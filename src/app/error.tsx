'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StarburstSticker } from '@/components/ui/DesignDecorations';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Graven Runtime Error:', error);

    // Automatic single-reload for ChunkLoadError caused by stale mobile service worker or cached chunks
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('ChunkLoadError');

    if (isChunkError && typeof window !== 'undefined') {
      const reloadedKey = 'graven_chunk_reload';
      if (!sessionStorage.getItem(reloadedKey)) {
        sessionStorage.setItem(reloadedKey, '1');
        window.location.reload();
      } else {
        sessionStorage.removeItem(reloadedKey);
      }
    }
  }, [error]);

  return (
    <div className="w-full bg-[#F6F4FF] min-h-[60vh] flex items-center justify-center p-6 lg:p-12">
      <div className="bento-card p-8 md:p-12 text-center max-w-md w-full bg-white relative">
        <StarburstSticker
          fillColor="#FF9CCB"
          className="w-14 h-14 absolute -top-4 -right-4 rotate-12"
        />

        <div className="w-24 h-24 mx-auto mb-6 relative">
          <Image
            src="/assets/logo.png"
            alt="Graven mascot"
            fill
            sizes="96px"
            className="object-contain"
          />
        </div>

        <div className="inline-block px-3.5 py-1 rounded-full bg-[#FF4D6D]/15 border-2 border-[#FF4D6D] text-xs font-mono font-bold uppercase tracking-wider mb-4 text-[#FF4D6D]">
          UNEXPECTED OCCURRENCE
        </div>

        <h1 className="font-heading text-3xl md:text-4xl text-[#0A0F2E] mb-3 uppercase tracking-tight">
          SOMETHING WENT BERSERK
        </h1>

        <p className="font-body text-[#0A0F2E]/80 text-sm md:text-base mb-8 leading-relaxed">
          The afterlife had a temporary hiccup. Hit retry or return to safety.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-bento bg-[#E4FF6B] text-[#0A0F2E] text-xs py-3.5 px-5"
          >
            TRY AGAIN ↗
          </button>
          <Link href="/" className="btn-bento bg-white text-[#0A0F2E] text-xs py-3.5 px-5">
            BACK HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
