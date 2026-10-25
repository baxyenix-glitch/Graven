'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GraveRecord } from '@/lib/db/schemas';
import { Gravestone } from '../grave/Gravestone';
import { ArrowRight, Eye, Flame, ChevronLeft, ChevronRight } from 'lucide-react';

interface RecentBurialsProps {
  graves: GraveRecord[];
}

export function RecentBurials({ graves }: RecentBurialsProps) {
  const [filter, setFilter] = useState<'all' | 'pons' | 'other' | 'risen'>('all');
  const [sort, setSort] = useState<'newest' | 'views'>('newest');
  const [mobilePage, setMobilePage] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Filter
  const filtered = graves.filter((g) => {
    if (filter === 'pons') return g.launchpad === 'pons';
    if (filter === 'other') return g.launchpad === 'other';
    if (filter === 'risen') return g.isRisen;
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'views') return b.viewsCount - a.viewsCount;
    return new Date(b.buriedAt).getTime() - new Date(a.buriedAt).getTime();
  });

  // Reset page when filter or sort changes
  useEffect(() => {
    setMobilePage(0);
  }, [filter, sort]);

  // Desktop shows 6 items (3 cols x 2 rows)
  const desktopDisplayed = sorted.slice(0, 6);

  // Mobile shows exactly 4 items at a time (2 cols x 2 rows)
  const pageSize = 4;
  const totalMobilePages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentMobilePage = Math.min(mobilePage, totalMobilePages - 1);
  const mobileDisplayed = sorted.slice(
    currentMobilePage * pageSize,
    (currentMobilePage + 1) * pageSize
  );

  const handlePrevPage = () => {
    setMobilePage((p) => Math.max(0, p - 1));
  };

  const handleNextPage = () => {
    setMobilePage((p) => Math.min(totalMobilePages - 1, p + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (deltaX > 45) {
      // Swiped right -> go to previous 4
      handlePrevPage();
    } else if (deltaX < -45) {
      // Swiped left -> go to next 4
      handleNextPage();
    }
    setTouchStartX(null);
  };

  // Time elapsed calculator
  const formatTimeAgo = (dateStr: string) => {
    const diffSec = Math.max(1, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
    if (diffSec < 60) return `buried ${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `buried ${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `buried ${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `buried ${diffDays}d ago`;
  };

  return (
    <div className="w-full bg-[#000000] p-3.5 sm:p-8 lg:p-10 flex flex-col justify-between h-full text-white">
      {/* Top Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="bento-pill bg-[#1237E8] text-white border-[#222222] mb-2">
              CEMETERY RECORDS
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl text-white uppercase tracking-tight">
              RECENT BURIALS
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-full border-[2px] border-[#222222]">
              {(['all', 'pons', 'other', 'risen'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold font-ui uppercase transition-colors cursor-pointer ${
                    filter === f
                      ? 'bg-[#1237E8] text-white border border-[#3F6EF5]'
                      : 'text-white hover:text-white hover:bg-white/10'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="bg-[#0A0A0A] border-[2px] border-[#222222] text-white rounded-full px-3 py-1 text-[11px] font-bold font-ui uppercase cursor-pointer outline-none"
            >
              <option value="newest">NEWEST</option>
              <option value="views">MOST VIEWS</option>
            </select>
          </div>
        </div>

        {/* Spacious Grave Grid: 3 columns on desktop/tablet, 2x2 grid with 4 cards at a time on mobile */}
        {sorted.length > 0 ? (
          <div className="space-y-6">
            {/* Desktop / Tablet Grid (3 columns on desktop, 2 on tablet) */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {desktopDisplayed.map((grave) => (
                <Link
                  key={grave.tokenAddress}
                  href={`/grave/${grave.tokenAddress}`}
                  className="group block"
                >
                  <div className="bento-card p-5 lg:p-6 bg-[#0A0A0A] border-[#222222] flex flex-col items-center hover:border-[#3F6EF5]">
                    {/* Gravestone Renderer */}
                    <div className="w-full max-w-[280px] group-hover:scale-[1.02] transition-transform duration-200">
                      <Gravestone
                        data={{
                          tokenAddress: grave.tokenAddress,
                          name: grave.name,
                          symbol: grave.symbol,
                          logoUrl: grave.logoUrl,
                          birthDate: grave.birthDate,
                          deathDate: grave.deathDate,
                          daysLived: grave.daysLived,
                          peakMcapEth: grave.peakMcapEth,
                          epitaph: grave.epitaph,
                          launchpad: grave.launchpad,
                          isRisen: grave.isRisen,
                        }}
                        variant="compact"
                      />
                    </div>

                    {/* Caption Strip: live "buried 10s ago", views, launchpad chip */}
                    <div className="w-full mt-4 pt-3 border-t-[2px] border-[#222222] flex items-center justify-between text-xs font-ui">
                      <div className="flex items-center gap-1.5 text-[#A3A3A3] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
                        <span suppressHydrationWarning>{formatTimeAgo(grave.buriedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 font-bold text-[#5CE1FF]">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{grave.viewsCount}</span>
                        </span>
                        <span className="bento-pill text-[9px] py-0.5 px-2 bg-[#000000] border-[#222222] text-white">
                          {grave.launchpad.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile View: Exactly 4 Gravestone Cards visible at a time in 2x2 grid with Left & Right Arrows */}
            <div className="sm:hidden flex flex-col gap-3">
              {/* Mobile Navigation Header: Page Counter & Left/Right Arrows */}
              <div className="flex items-center justify-between bg-[#0A0A0A] px-3 py-2 rounded-xl border-[2px] border-[#222222]">
                <div className="flex items-center gap-2">
                  <span className="font-ui text-xs font-bold text-white uppercase tracking-wide">
                    PLOT RECORD
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#000000] border border-[#222222] text-[10px] font-mono font-bold text-[#5CE1FF]">
                    PAGE {currentMobilePage + 1} / {totalMobilePages}
                  </span>
                </div>

                {/* Left and Right Arrow Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="mobile-graves-prev-btn"
                    onClick={handlePrevPage}
                    disabled={currentMobilePage === 0}
                    aria-label="Previous 4 graves"
                    className="w-8 h-8 rounded-full border-[2px] border-[#222222] bg-[#000000] flex items-center justify-center font-bold text-white shadow-[1.5px_1.5px_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    id="mobile-graves-next-btn"
                    onClick={handleNextPage}
                    disabled={currentMobilePage >= totalMobilePages - 1}
                    aria-label="Next 4 graves"
                    className="w-8 h-8 rounded-full border-[2px] border-[#222222] bg-[#000000] flex items-center justify-center font-bold text-white shadow-[1.5px_1.5px_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* The 2x2 Grid of 4 Gravestone Cards */}
              <div
                className="grid grid-cols-2 gap-2.5"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {mobileDisplayed.map((grave) => (
                  <Link
                    key={grave.tokenAddress}
                    href={`/grave/${grave.tokenAddress}`}
                    className="group block active:scale-[0.98] transition-transform"
                  >
                    <div className="bento-card p-2 bg-[#0A0A0A] border-[#222222] flex flex-col items-center justify-between h-full hover:border-[#1237E8] transition-colors">
                      <div className="w-full">
                        <Gravestone
                          data={{
                            tokenAddress: grave.tokenAddress,
                            name: grave.name,
                            symbol: grave.symbol,
                            logoUrl: grave.logoUrl,
                            birthDate: grave.birthDate,
                            deathDate: grave.deathDate,
                            daysLived: grave.daysLived,
                            peakMcapEth: grave.peakMcapEth,
                            epitaph: grave.epitaph,
                            launchpad: grave.launchpad,
                            isRisen: grave.isRisen,
                          }}
                          variant="mini"
                        />
                      </div>

                      {/* Caption Strip */}
                      <div className="w-full mt-2 pt-1.5 border-t-[1.5px] border-[#222222] flex items-center justify-between text-[9.5px] font-ui">
                        <div className="flex items-center gap-1 text-[#A3A3A3] font-medium truncate flex-1 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] shrink-0" />
                          <span suppressHydrationWarning className="truncate">{formatTimeAgo(grave.buriedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          <span className="flex items-center gap-0.5 font-bold text-[#5CE1FF]">
                            <Eye className="w-2.5 h-2.5" />
                            <span>{grave.viewsCount}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* If fewer than 4 graves on this page, render empty burial plot placeholders so 4 slots are visible */}
                {Array.from({ length: Math.max(0, 4 - mobileDisplayed.length) }).map((_, idx) => (
                  <Link
                    key={`empty-${idx}`}
                    href="/bury"
                    className="group block active:scale-[0.98] transition-transform"
                  >
                    <div className="bento-card p-3 bg-[#0A0A0A]/50 border-dashed border-[2px] border-[#222222] flex flex-col items-center justify-center text-center h-full min-h-[230px] hover:border-[#1237E8] hover:bg-[#0A0A0A] transition-all">
                      <div className="w-8 h-8 rounded-full bg-[#000000] border-[1.5px] border-[#222222] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                        <span className="font-heading text-base text-[#5CE1FF] font-bold">+</span>
                      </div>
                      <span className="font-heading text-xs text-white uppercase">
                        OPEN PLOT
                      </span>
                      <span className="font-body text-[9.5px] text-[#A3A3A3] mt-0.5">
                        Lay dead coin to rest
                      </span>
                      <span className="mt-2 text-[8.5px] font-mono font-bold text-[#5CE1FF] underline uppercase">
                        BURY TOKEN →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Bottom Pagination Bar with interactive indicator dots and Prev/Next buttons */}
              {totalMobilePages > 1 && (
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={currentMobilePage === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full border-[2px] border-[#222222] bg-[#0A0A0A] text-[11px] font-bold font-ui uppercase text-white shadow-[1.5px_1.5px_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>PREV</span>
                  </button>

                  {/* Dots Indicator */}
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalMobilePages }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setMobilePage(i)}
                        aria-label={`Go to page ${i + 1}`}
                        className={`transition-all rounded-full border border-[#222222] ${
                          i === currentMobilePage
                            ? 'w-5 h-2 bg-[#1237E8]'
                            : 'w-2 h-2 bg-[#0A0A0A] hover:bg-[#1A1A1A]'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={currentMobilePage >= totalMobilePages - 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full border-[2px] border-[#222222] bg-[#0A0A0A] text-[11px] font-bold font-ui uppercase text-white shadow-[1.5px_1.5px_0_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none transition-all cursor-pointer"
                  >
                    <span>NEXT</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bento-card p-8 sm:p-12 text-center bg-[#0A0A0A] border-[#222222] my-6 flex flex-col items-center">
            <div className="w-24 h-24 relative mb-4">
              <Image
                src="/assets/logo.png"
                alt="Empty Graven mascot"
                fill
                sizes="96px"
                className="object-contain"
              />
            </div>
            <h3 className="font-heading text-2xl text-white uppercase mb-2">
              NO GRAVES YET IN THIS PLOT
            </h3>
            <p className="font-body text-[#A3A3A3] text-sm max-w-sm mb-6">
              Be the pioneer creator to lay a dead coin to rest and establish the first monument.
            </p>
            <Link href="/bury" className="btn-bento btn-cyan text-xs">
              <span>BURY A TOKEN →</span>
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Action: View All Graves */}
      <div className="mt-8 pt-6 border-t-[2px] border-[#222222] flex justify-center">
        <Link
          href="/graves"
          className="btn-bento bg-[#0A0A0A] text-white border-[2px] border-[#222222] hover:bg-[#1A1A1A] text-xs sm:text-sm py-3 px-8"
        >
          <span>VIEW ALL GRAVES →</span>
        </Link>
      </div>
    </div>
  );
}