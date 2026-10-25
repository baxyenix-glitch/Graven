'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GraveRecord } from '@/lib/db/schemas';
import { Trophy, ArrowRight, Eye } from 'lucide-react';

interface TopGravesProps {
  graves: GraveRecord[];
}

export function TopGraves({ graves }: TopGravesProps) {
  // Sort by qualified views count
  const sorted = [...graves]
    .sort((a, b) => b.qualifiedViewsCount - a.qualifiedViewsCount || b.viewsCount - a.viewsCount)
    .slice(0, 3);

  const rankColors = ['bg-[#E4FF6B]', 'bg-[#D9D2FF]', 'bg-[#BFD8FF]'];

  return (
    <div className="w-full bg-[#5CE1FF] p-6 sm:p-8 lg:p-10 text-[#0A0F2E] flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-[2px] border-[#0A0F2E]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[12px] bg-white border-[2px] border-[#0A0F2E] shadow-[2px_2px_0_#0A0F2E] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[#0A0F2E]" />
            </div>
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl uppercase tracking-tight leading-none">
                TOP GRAVES
              </h2>
            </div>
          </div>
          <span className="bento-pill bg-white text-[10px]">
            MOST VISITED
          </span>
        </div>

        {/* 3 Stacked Bordered Cards */}
        <div className="space-y-4 mb-8">
          {sorted.length > 0 ? (
            sorted.map((grave, idx) => (
              <Link
                key={grave.tokenAddress}
                href={`/grave/${grave.tokenAddress}`}
                className="block group"
              >
                <div className="bg-white border-[2.5px] border-[#0A0F2E] rounded-[16px] p-4 shadow-[4px_4px_0_#0A0F2E] flex items-center justify-between group-hover:-translate-x-[1px] group-hover:-translate-y-[1px] transition-transform">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`w-8 h-8 rounded-[10px] ${rankColors[idx] || 'bg-gray-100'} border-[2px] border-[#0A0F2E] flex items-center justify-center font-ui font-bold text-xs text-[#0A0F2E] shrink-0 shadow-[1.5px_1.5px_0_#0A0F2E]`}
                    >
                      #{idx + 1}
                    </div>

                    {/* Logo & Details */}
                    <div className="w-10 h-10 rounded-[10px] border-[2px] border-[#0A0F2E] overflow-hidden bg-[#F6F4FF] relative shrink-0 flex items-center justify-center font-ui font-bold text-xs text-[#0A0F2E]">
                      {grave.logoUrl && grave.logoUrl !== '/assets/logo.png' ? (
                        <Image
                          src={grave.logoUrl}
                          alt={grave.name}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <span>{grave.symbol?.slice(0, 3) || 'RIP'}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-heading text-base leading-tight uppercase truncate max-w-[120px] sm:max-w-[140px] group-hover:text-[#1237E8] transition-colors">
                        {grave.name}
                      </h4>
                      <div className="text-[11px] font-ui font-bold text-[#0A0F2E]/60 truncate">
                        ${grave.symbol}
                      </div>
                    </div>
                  </div>

                  {/* Qualified Views */}
                  <div className="text-right shrink-0 ml-2">
                    <div className="flex items-center gap-1 font-heading text-lg text-[#1237E8]">
                      <Eye className="w-3.5 h-3.5 text-[#1237E8]" />
                      <span>{grave.qualifiedViewsCount}</span>
                    </div>
                    <div className="text-[9px] font-ui text-[#0A0F2E]/70 uppercase font-bold">
                      QUALIFIED
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-6 bg-white border-[2.5px] border-[#0A0F2E] rounded-[16px] text-center text-xs font-ui text-[#0A0F2E]/70 shadow-[3px_3px_0_#0A0F2E]">
              No visits recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Button to Leaderboard */}
      <div className="pt-4 border-t-[2px] border-[#0A0F2E]">
        <Link
          href="/leaderboard"
          className="btn-bento btn-cobalt w-full py-3 text-xs justify-center"
        >
          <span>VIEW LEADERBOARD →</span>
        </Link>
      </div>
    </div>
  );
}