'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isAddress } from 'viem';
import { Search, X, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setError(null);
      setLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    if (!isAddress(clean, { strict: false })) {
      setError('Please enter a valid Robinhood Chain token address (0x...)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/graves/${clean.toLowerCase()}`, {
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        onClose();
        router.push(`/grave/${clean.toLowerCase()}`);
      } else if (res.status === 404) {
        onClose();
        router.push(`/bury?token=${clean.toLowerCase()}`);
      } else {
        setError('Unable to fetch grave details. Try again.');
      }
    } catch {
      onClose();
      router.push(`/grave/${clean.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-[#000000]/80 backdrop-blur-sm flex items-start justify-center pt-20 sm:pt-24 px-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-[#0A0A0A] border-[2.5px] border-[#222222] rounded-[24px] sm:rounded-[28px] shadow-[6px_6px_0_#000000] sm:shadow-[8px_8px_0_#000000] p-6 relative text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="bento-pill bg-[#1237E8] text-white border-[#222222]">
              SEARCH CEMETERY
            </span>
            <span className="text-[11px] font-ui font-bold text-[#A3A3A3]">ESC TO CLOSE</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="btn-icon w-8 h-8 rounded-[10px]"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-[#A3A3A3] absolute left-4 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste dead coin contract address (0x...)"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="search"
              className="w-full h-12 pl-12 pr-28 rounded-[16px] border-[2px] border-[#262626] bg-[#121212] text-white text-sm sm:text-base font-ui outline-none focus:outline-none focus:ring-2 focus:ring-[#1237E8]"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-1.5 h-9 px-4 rounded-[12px] btn-bento btn-cobalt text-xs disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>FIND</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 text-xs font-ui font-bold text-[#FF4D6D] bg-[#FF4D6D]/10 p-2.5 rounded-[12px] border-[2px] border-[#FF4D6D]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-4 pt-4 border-t-[2px] border-[#222222] flex items-center justify-between text-xs font-ui text-[#A3A3A3]">
            <span>Search by full ERC-20 contract address</span>
            <span className="font-bold text-white">Robinhood Chain</span>
          </div>
        </form>
      </div>
    </div>
  );
}
