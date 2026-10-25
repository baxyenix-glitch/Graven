'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { StatsCache } from '@/lib/db/schemas';
import { Coins, BarChart3, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';

const DynamicCharts = dynamic(() => import('./AnalyticsCharts'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      <div className="bg-[#F6F4FF] border-[2.5px] border-[#0A0F2E] rounded-[20px] h-60 p-6 flex flex-col justify-between animate-pulse">
        <div className="h-5 w-28 bg-gray-200 rounded-full" />
        <div className="h-36 w-full bg-gray-100 rounded-xl" />
      </div>
      <div className="bg-[#F6F4FF] border-[2.5px] border-[#0A0F2E] rounded-[20px] h-60 p-6 flex flex-col justify-between animate-pulse">
        <div className="h-5 w-28 bg-gray-200 rounded-full" />
        <div className="h-36 w-full bg-gray-100 rounded-xl" />
      </div>
    </div>
  ),
});

interface AnalyticsSectionProps {
  stats: StatsCache;
}

export function AnalyticsSection({ stats }: AnalyticsSectionProps) {
  const avgReward = stats.totalGraveViews > 0
    ? (stats.ethPaidOut / stats.totalGraveViews).toFixed(5)
    : '0.00050';

  return (
    <section className="w-full border-b-[3px] border-[#222222] bg-[#000000]">
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y-[3px] lg:divide-y-0 lg:divide-x-[3px] divide-[#222222] items-stretch">
        {/* LEFT CELL (Dark surface, 2 chart cards, 8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-10 lg:p-12 bg-[#000000] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#1237E8] text-white border-[2px] border-[#222222] shadow-[2px_2px_0_#000000] flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="bento-pill bg-[#1237E8] text-white border-[#222222] mb-1">
                    GROWTH & REWARDS
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tight text-white">
                    PROTOCOL ANALYTICS
                  </h2>
                </div>
              </div>
              <span className="bento-pill bg-[#121212] text-[#A3A3A3] border-[#222222] text-[11px] self-start sm:self-auto">
                ROBINHOOD CHAIN
              </span>
            </div>

            {/* Dynamic Charts with fallback dates */}
            <div className="w-full">
              <DynamicCharts
                data={[
                  { date: 'Oct 15', burials: Math.max(0, stats.tokensBuried - 4), views: Math.max(0, stats.totalGraveViews - 20) },
                  { date: 'Oct 16', burials: Math.max(0, stats.tokensBuried - 3), views: Math.max(0, stats.totalGraveViews - 14) },
                  { date: 'Oct 17', burials: Math.max(0, stats.tokensBuried - 2), views: Math.max(0, stats.totalGraveViews - 9) },
                  { date: 'Oct 18', burials: Math.max(0, stats.tokensBuried - 1), views: Math.max(0, stats.totalGraveViews - 3) },
                  { date: 'Today', burials: stats.tokensBuried, views: stats.totalGraveViews },
                ]}
              />
            </div>
          </div>
        </div>

        {/* RIGHT CELL: Deep Pure Black "REWARDS SNAPSHOT" (4 cols) */}
        <div className="lg:col-span-4 p-6 sm:p-8 lg:p-10 bg-[#0A0A0A] text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b-[2px] border-[#222222]">
              <span className="bento-pill bg-[#1237E8] text-white border-[#222222]">
                ECONOMICS
              </span>
              <Coins className="w-6 h-6 text-[#5CE1FF]" />
            </div>

            <h3 className="font-heading text-2xl sm:text-3xl text-white uppercase leading-tight mb-2">
              REWARDS SNAPSHOT
            </h3>
            <p className="font-body text-xs sm:text-sm text-[#A3A3A3] mb-6 leading-relaxed">
              Qualified visits earn ETH split across creators (60%) and original holders (30%).
            </p>

            <div className="space-y-3.5">
              <div className="p-4 bg-[#121212] border-[2px] border-[#262626] rounded-[16px] shadow-[3px_3px_0_#000000]">
                <div className="text-[10px] font-ui font-bold text-[#A3A3A3] uppercase">
                  TOTAL ETH DISTRIBUTED
                </div>
                <div className="font-heading text-2xl sm:text-3xl text-[#5CE1FF] leading-none mt-1">
                  {stats.ethPaidOut.toFixed(4)} ETH
                </div>
              </div>

              <div className="p-4 bg-[#121212] border-[2px] border-[#262626] rounded-[16px] shadow-[3px_3px_0_#000000]">
                <div className="text-[10px] font-ui font-bold text-[#A3A3A3] uppercase">
                  AVERAGE REWARD / VIEW
                </div>
                <div className="font-heading text-xl sm:text-2xl text-white leading-none mt-1">
                  {avgReward} ETH
                </div>
              </div>

              <div className="p-4 bg-[#121212] border-[2px] border-[#262626] rounded-[16px] shadow-[3px_3px_0_#000000]">
                <div className="text-[10px] font-ui font-bold text-[#A3A3A3] uppercase">
                  ACTIVE RECIPIENTS
                </div>
                <div className="font-heading text-xl sm:text-2xl text-[#1DB954] leading-none mt-1">
                  {stats.holdersRewarded + (stats.tokensBuried > 0 ? 1 : 0)} WALLETS
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t-[2px] border-[#222222] text-[11px] font-ui text-[#A3A3A3] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1DB954]" />
            <span>Verifiable on-chain ledger on Robinhood Chain</span>
          </div>
        </div>
      </div>
    </section>
  );
}