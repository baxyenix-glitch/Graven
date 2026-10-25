'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';

export interface GravestoneData {
  tokenAddress: string;
  name: string;
  symbol: string;
  logoUrl?: string;
  birthDate?: string;
  deathDate?: string;
  daysLived?: number;
  peakMcapEth?: number;
  epitaph?: string;
  launchpad?: 'pons' | 'other';
  isRisen?: boolean;
  signature?: string;
}

interface GravestoneProps {
  data: GravestoneData;
  variant?: 'compact' | 'full' | 'mini';
  animateRising?: boolean;
  className?: string;
}

export function Gravestone({
  data,
  variant = 'compact',
  animateRising = false,
  className = '',
}: GravestoneProps) {
  const [imgError, setImgError] = useState(false);

  const {
    name,
    symbol,
    logoUrl,
    birthDate = 'MAR 2026',
    deathDate = 'APR 2026',
    daysLived = 14,
    peakMcapEth = 0,
    epitaph = 'Gone but not forgotten on the blockchain.',
    launchpad = 'other',
    isRisen = false,
  } = data;

  const isFull = variant === 'full';
  const isMini = variant === 'mini';

  // Format dates
  const formatDateStr = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    } catch {
      return dateStr;
    }
  };

  const formattedBorn = formatDateStr(birthDate);
  const formattedDied = formatDateStr(deathDate);

  // Fallback initials
  const initials = (symbol || name || 'RIP').slice(0, 3).toUpperCase();

  const content = (
    <div
      className={`relative w-full aspect-[4/5] ${isMini ? 'max-w-[220px]' : 'max-w-[420px]'} mx-auto select-none overflow-hidden ${className}`}
      style={{ filter: isMini ? 'drop-shadow(0 4px 8px rgba(10, 15, 46, 0.10))' : 'drop-shadow(0 8px 16px rgba(10, 15, 46, 0.12))' }}
    >
      {/* BASE LAYER: Real Unmodified Gravestone PNG */}
      <Image
        src="/assets/gravestone.png"
        alt={`Gravestone for ${name} ($${symbol})`}
        fill
        sizes={isMini ? '(max-width: 640px) 180px, 220px' : '(max-width: 640px) 320px, 420px'}
        priority={isFull}
        className="object-contain pointer-events-none select-none z-0"
      />

      {/* INSCRIPTION CONTAINER: Precisely scaled within the stone arch face */}
      <div
        className="absolute z-10 flex flex-col items-center text-center justify-between pointer-events-none"
        style={{
          top: isMini ? '14%' : '15%',
          bottom: isMini ? '28%' : '31%',
          left: isMini ? '20%' : '23%',
          right: isMini ? '20%' : '23%',
          padding: isMini ? '3px 4px' : isFull ? '12px 14px' : '8px 10px',
        }}
      >
        {/* TOP: Token Logo */}
        <div className="flex flex-col items-center shrink-0">
          <div
            className={`rounded-full border-[1.5px] border-[#0A0F2E]/30 bg-white/95 shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)] flex items-center justify-center overflow-hidden ${isMini ? 'w-6 h-6 mb-0.5' : isFull ? 'w-13 h-13 mb-1.5' : 'w-9 h-9 mb-1'
              }`}
          >
            {logoUrl && logoUrl !== '/assets/logo.png' && !imgError ? (
              <Image
                src={logoUrl}
                alt={`${symbol} logo`}
                width={isMini ? 24 : isFull ? 52 : 36}
                height={isMini ? 24 : isFull ? 52 : 36}
                onError={() => setImgError(true)}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className={`font-heading text-[#0A0F2E] font-bold ${isMini ? 'text-[8px]' : 'text-xs'}`}>
                {initials}
              </span>
            )}
          </div>

          {/* NAME & TICKER (Deep navy engraved stone effect) */}
          <div className="flex flex-col items-center">
            <h3
              className={`font-heading tracking-tight text-[#0A0F2E] uppercase leading-none truncate ${isMini ? 'text-[10px] max-w-[95px]' : isFull ? 'text-lg sm:text-xl max-w-[170px]' : 'text-sm sm:text-base max-w-[170px]'
                }`}
              style={{
                textShadow: '0 1px 0 rgba(255, 255, 255, 0.95), 0 -1px 0 rgba(10, 15, 46, 0.15)',
              }}
              title={name}
            >
              {name}
            </h3>
            <span
              className={`font-mono font-bold text-[#0A0F2E]/80 tracking-wider ${isMini ? 'text-[7.5px] mt-0.5' : isFull ? 'text-xs mt-0.5' : 'text-[10px]'
                }`}
              style={{ textShadow: '0 1px 0 rgba(255, 255, 255, 0.9)' }}
            >
              ${symbol}
            </span>
          </div>
        </div>

        {/* MIDDLE: Dates & Lifespan */}
        <div className="flex flex-col items-center shrink-0 my-0.5">
          <div
            className={`font-mono text-[#0A0F2E]/90 font-medium tracking-tight ${isMini ? 'text-[6.5px] leading-tight' : isFull ? 'text-[10.5px] leading-tight' : 'text-[8.5px] leading-tight'
              }`}
            style={{ textShadow: '0 1px 0 rgba(255, 255, 255, 0.9)' }}
          >
            {isMini ? (
              <div>{formattedBorn} - {formattedDied}</div>
            ) : (
              <>
                <div>BORN {formattedBorn}</div>
                <div>DIED {formattedDied}</div>
              </>
            )}
          </div>
          <div
            className={`font-mono font-bold text-[#0A0F2E] bg-[#BFD8FF] rounded-full border border-[#0A0F2E]/30 ${isMini ? 'text-[6.5px] mt-0.5 px-1 py-0 leading-none' : isFull ? 'text-[10px] mt-1 px-2 py-0.5' : 'text-[8.5px] mt-1 px-2 py-0.5'
              }`}
          >
            LIVED {daysLived} DAYS
          </div>
        </div>

        {/* PEAK MCAP */}
        <div
          className={`font-mono text-[#0A0F2E]/85 flex items-center gap-1 font-semibold ${isMini ? 'text-[7px]' : isFull ? 'text-[11px]' : 'text-[9px]'
            }`}
          style={{ textShadow: '0 1px 0 rgba(255, 255, 255, 0.9)' }}
        >
          <TrendingUp className={`${isMini ? 'w-2 h-2' : 'w-2.5 h-2.5'} text-[#1237E8]`} />
          <span>PEAK: {peakMcapEth > 0 ? `${peakMcapEth.toFixed(2)} ETH` : 'N/A'}</span>
        </div>

        {/* EPITAPH (Italic, max 140 chars, line clamped) */}
        <div className={`my-0.5 px-0.5 text-center ${isMini ? 'max-w-[105px]' : 'max-w-[190px]'}`}>
          <p
            className={`italic font-serif text-[#0A0F2E]/90 leading-tight ${isMini ? 'text-[7px] line-clamp-1' : isFull ? 'text-xs line-clamp-2' : 'text-[9.5px] line-clamp-2'
              }`}
            style={{ textShadow: '0 1px 0 rgba(255, 255, 255, 0.95)' }}
          >
            &ldquo;{epitaph}&rdquo;
          </p>
        </div>

        {/* BOTTOM BADGES: Launchpad, Risen, Signed mark */}
        <div className={`flex items-center justify-center shrink-0 pt-0.5 ${isMini ? 'gap-0.5' : 'gap-1'}`}>
          {launchpad === 'pons' ? (
            <span className={`rounded-full bg-[#E4FF6B] border border-[#0A0F2E]/40 font-bold font-mono text-[#0A0F2E] ${isMini ? 'px-1 py-0 text-[6px]' : 'px-1.5 py-0.5 text-[8px]'
              }`}>
              PONS
            </span>
          ) : (
            <span className={`rounded-full bg-[#BFD8FF] border border-[#0A0F2E]/40 font-bold font-mono text-[#0A0F2E] ${isMini ? 'px-1 py-0 text-[6px]' : 'px-1.5 py-0.5 text-[8px]'
              }`}>
              OTHER
            </span>
          )}

          {isRisen && (
            <span className={`rounded-full bg-[#5CE1FF] border border-[#0A0F2E]/40 font-bold font-mono text-[#0A0F2E] flex items-center gap-0.5 ${isMini ? 'px-1 py-0 text-[6px]' : 'px-1.5 py-0.5 text-[8px]'
              }`}>
              <Sparkles className={`${isMini ? 'w-1.5 h-1.5' : 'w-2 h-2'} text-[#0A1FC4]`} />
              <span>RISEN</span>
            </span>
          )}

          <span className={`rounded-full bg-white/90 border border-[#0A0F2E]/40 font-mono text-[#0A0F2E] flex items-center gap-0.5 font-bold ${isMini ? 'px-1 py-0 text-[6px]' : 'px-1.5 py-0.5 text-[8px]'
            }`}>
            <CheckCircle2 className={`${isMini ? 'w-1.5 h-1.5' : 'w-2 h-2'} text-[#1DB954]`} />
            <span>SIGNED</span>
          </span>
        </div>
      </div>
    </div>
  );

  if (animateRising) {
    return (
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 100 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
