'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Graven Global Error Caught:', error);

    // Automatic single-reload for ChunkLoadError caused by stale mobile service worker or cached chunks
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('ChunkLoadError');

    if (isChunkError && typeof window !== 'undefined') {
      const reloadedKey = 'graven_global_chunk_reload';
      if (!sessionStorage.getItem(reloadedKey)) {
        sessionStorage.setItem(reloadedKey, '1');
        window.location.reload();
      } else {
        sessionStorage.removeItem(reloadedKey);
      }
    }
  }, [error]);

  return (
    <html lang="en">
      <body style={{ backgroundColor: '#F6F4FF', color: '#0A0F2E', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ border: '3px solid #0A0F2E', borderRadius: '30px', boxShadow: '0 6px 0 #0A0F2E', padding: '32px', textAlign: 'center', maxWidth: '480px', backgroundColor: '#FFFFFF', width: '100%' }}>
            <h1 style={{ textTransform: 'uppercase', fontSize: '24px', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
              GRAVEN NOTICE
            </h1>
            <p style={{ fontSize: '14px', color: '#0A0F2E', opacity: 0.8, marginBottom: '16px', lineHeight: 1.5 }}>
              A temporary display glitch occurred. Click below to reload Graven.
            </p>
            {error?.message && (
              <div style={{ backgroundColor: '#FEE2E2', border: '2px solid #EF4444', borderRadius: '12px', padding: '12px', marginBottom: '20px', textAlign: 'left', fontSize: '12px', fontFamily: 'monospace', color: '#991B1B', wordBreak: 'break-word', maxHeight: '140px', overflowY: 'auto' }}>
                {error.message}
              </div>
            )}
            <button
              type="button"
              onClick={() => reset()}
              style={{
                borderRadius: '9999px',
                border: '2.5px solid #0A0F2E',
                boxShadow: '0 4px 0 #0A0F2E',
                background: 'linear-gradient(135deg, #E4FF6B 0%, #C9F56B 100%)',
                color: '#0A0F2E',
                fontWeight: 700,
                padding: '12px 28px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              RETRY GRAVEN
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

