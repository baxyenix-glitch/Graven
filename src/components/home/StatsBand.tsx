'use client';

import React from 'react';
import Link from 'next/link';
import { StatsCache } from '@/lib/db/schemas';
import {
  Flame,
  Eye,
  Coins,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  Activity,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

interface StatsBandProps {
  stats: StatsCache;
}

export function StatsBand({ stats }: StatsBandProps) {
  const statTiles = [
    {
      label: 'TOKENS BURIED',
      value: (stats.tokensBuried ?? 0).toLocaleString(),
      badge: 'VERIFIED',
      badgeColor: 'bg-[#5CE1FF]/15 text-[#5CE1FF] border-[#5CE1FF]/40',
      icon: Flame,
      iconBg: 'bg-[#FF4D6D]/15 text-[#FF4D6D] border-[#FF4D6D]/30',
      glow: 'shadow-[0_0_15px_rgba(255,77,109,0.15)]',
    },
    {
      label: 'TOTAL GRAVE VIEWS',
      value: (stats.totalGraveViews ?? 0).toLocaleString(),
      badge: 'TRAFFIC',
      badgeColor: 'bg-[#5CE1FF]/15 text-[#5CE1FF] border-[#5CE1FF]/40',
      icon: Eye,
      iconBg: 'bg-[#5CE1FF]/15 text-[#5CE1FF] border-[#5CE1FF]/30',
      glow: 'shadow-[0_0_15px_rgba(92,225,255,0.15)]',
    },
    {
      label: 'ETH PAID OUT',
      value: `${(stats.ethPaidOut ?? 0).toFixed(4)}`,
      badge: 'DIVIDENDS',
      badgeColor: 'bg-[#E4FF6B]/15 text-[#E4FF6B] border-[#E4FF6B]/40',
      icon: Coins,
      iconBg: 'bg-[#E4FF6B]/15 text-[#E4FF6B] border-[#E4FF6B]/30',
      glow: 'shadow-[0_0_15px_rgba(228,255,107,0.15)]',
    },
    {
      label: 'HOLDERS REWARDED',
      value: (stats.holdersRewarded ?? 0).toLocaleString(),
      badge: 'COMMUNITY',
      badgeColor: 'bg-[#BFD8FF]/15 text-[#BFD8FF] border-[#BFD8FF]/40',
      icon: Users,
      iconBg: 'bg-[#1237E8]/20 text-[#5CE1FF] border-[#3F6EF5]/30',
      glow: 'shadow-[0_0_15px_rgba(18,55,232,0.15)]',
    },
    {
      label: 'BURIED TODAY',
      value: (stats.buriedToday ?? 0).toLocaleString(),
      badge: '24H PACE',
      badgeColor: 'bg-[#D9D2FF]/15 text-[#D9D2FF] border-[#D9D2FF]/40',
      icon: Calendar,
      iconBg: 'bg-[#D9D2FF]/15 text-[#D9D2FF] border-[#D9D2FF]/30',
      glow: 'shadow-[0_0_15px_rgba(217,210,255,0.15)]',
    },
    {
      label: 'ACTIVE GRAVES',
      value: (stats.activeGraves ?? 0).toLocaleString(),
      badge: 'LIVE POOLS',
      badgeColor: 'bg-[#1DB954]/15 text-[#1DB954] border-[#1DB954]/40',
      icon: Sparkles,
      iconBg: 'bg-[#1DB954]/15 text-[#1DB954] border-[#1DB954]/30',
      glow: 'shadow-[0_0_15px_rgba(29,185,84,0.15)]',
    },
  ];

  return (
    <section className="w-full border-b-[3px] border-[#222222] bg-[#000000]">
      {/* Section Header Bar */}
      <div className="px-6 lg:px-8 py-5 border-b-[2px] border-[#222222] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-[#262626] text-xs font-mono font-bold text-white">
            <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
            <span>ROBINHOOD CHAIN PROTOCOL DATA</span>
          </div>
          <span className="text-xs font-mono text-[#A3A3A3] hidden md:inline">
            // LIVE REAL-TIME METRICS
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#A3A3A3]">
          <ShieldCheck className="w-4 h-4 text-[#5CE1FF]" />
          <span>60% CREATOR / 30% HOLDERS / 10% TREASURY</span>
        </div>
      </div>

      {/* 6 High-Impact Cards Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y-[2px] sm:divide-y-0 divide-[#222222] sm:divide-x-[2px] bg-[#000000]">
        {statTiles.map((tile, idx) => {
          const IconComp = tile.icon;
          return (
            <div
              key={idx}
              className="p-5 sm:p-6 bg-[#0A0A0A] hover:bg-[#111111] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div
                    className={`w-10 h-10 rounded-[12px] border-[2px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${tile.iconBg} ${tile.glow}`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tile.badgeColor}`}
                  >
                    {tile.badge}
                  </span>
                </div>

                <div className="font-heading text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-none mb-1.5 truncate">
                  {tile.value}
                </div>
              </div>

              <div className="pt-2 border-t border-[#222222]">
                <div className="font-ui font-bold text-[11px] sm:text-xs text-white uppercase tracking-wider truncate">
                  {tile.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Live Ticker */}
      {stats.recentEvents && stats.recentEvents.length > 0 && (
        <div className="border-t-[2px] border-[#222222] bg-[#050505] px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 overflow-hidden">
          <div className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141414] border border-[#262626] text-[11px] font-mono font-bold text-white">
            <Activity className="w-3.5 h-3.5 text-[#5CE1FF]" />
            <span>LATEST ACTIVITY</span>
          </div>

          <div className="flex-1 overflow-x-auto no-scrollbar w-full flex items-center gap-2.5 text-xs font-ui">
            {stats.recentEvents.slice(0, 8).map((evt) => (
              <div
                key={evt.id}
                className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-[12px] bg-[#0A0A0A] border border-[#262626] text-white font-medium hover:border-[#3F6EF5] transition-colors"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    evt.type === 'BURIED' ? 'bg-[#FF4D6D]' : 'bg-[#1DB954]'
                  }`}
                />
                <span className="text-white text-xs">{evt.description}</span>
                {evt.tokenAddress && evt.tokenAddress.startsWith('0x') && (
                  <Link
                    href={`/grave/${evt.tokenAddress}`}
                    className="underline text-[#5CE1FF] font-bold hover:text-white ml-1 text-xs"
                  >
                    VIEW →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}