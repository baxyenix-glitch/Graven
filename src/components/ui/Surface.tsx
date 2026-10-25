'use client';

import React from 'react';

export type SurfaceTone =
  | 'cream'
  | 'white'
  | 'lavender'
  | 'ice'
  | 'cyan'
  | 'lime'
  | 'bubble'
  | 'cobalt'
  | 'royal'
  | 'midnight';

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: SurfaceTone;
  children: React.ReactNode;
  className?: string;
  bordered?: boolean;
}

const TONE_CONFIG: Record<
  SurfaceTone,
  { bg: string; text: string; hexBg: string; hexText: string; border?: string }
> = {
  cream: {
    bg: 'bg-[#F6F4FF]',
    text: 'text-[#0A0F2E]',
    hexBg: '#F6F4FF',
    hexText: '#0A0F2E',
    border: 'border-[#0A0F2E]',
  },
  white: {
    bg: 'bg-[#FFFFFF]',
    text: 'text-[#0A0F2E]',
    hexBg: '#FFFFFF',
    hexText: '#0A0F2E',
    border: 'border-[#0A0F2E]',
  },
  lavender: {
    bg: 'bg-[#D9D2FF]',
    text: 'text-[#0A0F2E]',
    hexBg: '#D9D2FF',
    hexText: '#0A0F2E',
    border: 'border-[#0A0F2E]',
  },
  ice: {
    bg: 'bg-[#BFD8FF]',
    text: 'text-[#0A0F2E]',
    hexBg: '#BFD8FF',
    hexText: '#0A0F2E',
    border: 'border-[#0A0F2E]',
  },
  cyan: {
    bg: 'bg-[#5CE1FF]',
    text: 'text-[#0A0F2E]',
    hexBg: '#5CE1FF',
    hexText: '#0A0F2E',
    border: 'border-[#0A0F2E]',
  },
  lime: {
    bg: 'bg-[#E4FF6B]',
    text: 'text-[#0A0F2E]',
    hexBg: '#E4FF6B',
    hexText: '#0A0F2E',
    border: 'border-[#0A0F2E]',
  },
  bubble: {
    bg: 'bg-[#FF9CCB]',
    text: 'text-[#0A0F2E]',
    hexBg: '#FF9CCB',
    hexText: '#0A0F2E',
    border: 'border-[#0A0F2E]',
  },
  cobalt: {
    bg: 'bg-[#1237E8]',
    text: 'text-[#FFFFFF]',
    hexBg: '#1237E8',
    hexText: '#FFFFFF',
    border: 'border-[#0A0F2E]',
  },
  royal: {
    bg: 'bg-[#0A1FC4]',
    text: 'text-[#FFFFFF]',
    hexBg: '#0A1FC4',
    hexText: '#FFFFFF',
    border: 'border-[#0A0F2E]',
  },
  midnight: {
    bg: 'bg-[#0A0F2E]',
    text: 'text-[#FFFFFF]',
    hexBg: '#0A0F2E',
    hexText: '#FFFFFF',
    border: 'border-[#BFD8FF]',
  },
};

/**
 * Surface component enforces high-contrast background and text pairing.
 * Never allows text color to be decoupled from its underlying surface.
 */
export function Surface({
  tone = 'white',
  children,
  className = '',
  bordered = false,
  style,
  ...props
}: SurfaceProps) {
  const config = TONE_CONFIG[tone] || TONE_CONFIG.white;
  const borderClass = bordered ? `border-[2.5px] ${config.border}` : '';

  return (
    <div
      style={{
        backgroundColor: config.hexBg,
        color: config.hexText,
        ...style,
      }}
      className={`${config.bg} ${config.text} ${borderClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * High-contrast muted text utility constants:
 * - On light surfaces: #3B4170 (Contrast > 7:1 on white/cream)
 * - On dark surfaces: #D6DDFF (Contrast > 5.5:1 on cobalt/midnight)
 */
export const TEXT_MUTED_LIGHT = 'text-[#3B4170]';
export const TEXT_MUTED_DARK = 'text-[#D6DDFF]';
