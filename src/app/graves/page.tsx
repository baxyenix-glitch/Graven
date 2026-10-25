'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Gravestone } from '@/components/grave/Gravestone';
import { GraveRecord } from '@/lib/db/schemas';
import { Search, Compass, Eye, Flame } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';

export default function GravesPage() {
  const [graves, setGraves] = useState<GraveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pons' | 'other' | 'risen'>('all');
  const [sort, setSort] = useState<'newest' | 'views' | 'earned'>('newest');
  const [search, setSearch] = useState('');

  const fetchGraves = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/graves?filter=${filter}&sort=${sort}&q=${encodeURIComponent(search)}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = await res.json();
        setGraves(data.graves || []);
      } else {
        setError('Failed to load graves from server.');
      }
    } catch (err: any) {
      console.error('Failed to load graves:', err);
      setError(err?.name === 'TimeoutError' ? 'Request timed out after 8s.' : 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraves();
  }, [filter, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGraves();
  };

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
    <div className="w-full bg-[#000000] text-white flex flex-col">
      {/* 1. BENTO HEADER ROW */}
      <div className="flex flex-col lg:flex-row items-stretch divide-y-[3px] lg:divide-y-0 lg:divide-x-[3px] divide-[#222222] border-b-[3px] border-[#222222]">
        {/* Label Cell */}
        <div className="bg-[#0A0A0A] p-6 lg:p-8 shrink-0 lg:w-72 flex flex-col justify-center">
          <div className="bento-pill bg-[#1237E8] text-white border-[#222222] mb-2 w-fit">
            <Compass className="w-3.5 h-3.5" />
            <span>DIRECTORY</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl text-white uppercase tracking-tight leading-none">
            ALL BURIED TOKENS →
          </h1>
        </div>

        {/* Right Description & Action Cell */}
        <div className="p-6 lg:p-8 bg-[#000000] flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <p className="font-body text-[#A3A3A3] text-sm sm:text-base max-w-xl leading-relaxed">
            Explore the permanent resting places of dead coins on Robinhood Chain. Visit to view verified on-chain histories and unlock continuous holder rewards.
          </p>

          <ButtonLink
            href="/bury"
            variant="cyan"
            size="md"
            icon={<Flame className="w-4 h-4 text-[#0A0F2E]" />}
            className="shrink-0 self-start sm:self-center"
          >
            BURY A TOKEN →
          </ButtonLink>
        </div>
      </div>

      {/* 2. TOOLBAR CELL: Search Form, Filter Chips, Sort, Result Count */}
      <div className="p-5 sm:p-6 bg-[#0A0A0A] border-b-[3px] border-[#222222] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, symbol, or address..."
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            className="w-full h-11 pl-10 pr-24 rounded-[16px] border-[2px] border-[#262626] bg-[#121212] text-white text-xs sm:text-sm font-ui outline-none focus:ring-2 focus:ring-[#1237E8]"
          />
          <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-3.5 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-1 top-1 h-9 px-4 rounded-[12px] btn-bento btn-cobalt text-xs"
          >
            SEARCH
          </button>
        </form>

        {/* Filter Chips & Sort Select */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-full border border-[#262626]">
            {(['all', 'pons', 'other', 'risen'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold font-ui uppercase transition-colors cursor-pointer ${
                  filter === f
                    ? 'bg-[#1237E8] text-white border border-[#222222]'
                    : 'text-[#A3A3A3] hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="bg-[#121212] border border-[#262626] text-white rounded-full px-3 py-1 text-[11px] font-bold font-ui uppercase cursor-pointer outline-none"
          >
            <option value="newest">NEWEST</option>
            <option value="views">MOST VIEWS</option>
            <option value="earned">MOST REWARDS</option>
          </select>

          <span className="bento-pill bg-[#121212] text-[#A3A3A3] border-[#262626] text-[11px]">
            {graves.length} {graves.length === 1 ? 'GRAVE' : 'GRAVES'}
          </span>
        </div>
      </div>

      {/* 3. SPACIOUS GRAVE GRID */}
      <div className="p-6 sm:p-10 lg:p-12 bg-[#000000]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bento-card p-6 bg-[#0A0A0A] border-[2px] border-[#222222] h-96 flex flex-col justify-between animate-pulse"
              >
                <div className="w-3/4 h-6 bg-[#1A1A1A] rounded-full mx-auto" />
                <div className="w-48 h-48 bg-[#1A1A1A] rounded-[20px] mx-auto" />
                <div className="w-full h-8 bg-[#1A1A1A] rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bento-card p-8 sm:p-12 text-center bg-[#0A0A0A] border-[2px] border-[#FF3B30]/40 max-w-lg mx-auto flex flex-col items-center my-8">
            <h2 className="font-heading text-xl sm:text-2xl text-[#FF3B30] uppercase mb-2">
              FAILED TO LOAD MEMORIALS
            </h2>
            <p className="font-body text-[#A3A3A3] text-sm mb-6 max-w-xs">
              {error}
            </p>
            <button
              type="button"
              onClick={fetchGraves}
              className="btn-bento btn-cobalt text-xs py-2 px-6"
            >
              <span>RETRY</span>
            </button>
          </div>
        ) : graves.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {graves.map((grave) => (
              <Link
                key={grave.tokenAddress}
                href={`/grave/${grave.tokenAddress}`}
                className="group block"
              >
                <div className="bento-card p-5 sm:p-6 bg-[#0A0A0A] border-[2px] border-[#222222] hover:-translate-y-1 transition-transform flex flex-col items-center">
                  {/* Gravestone Component */}
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

                  {/* Caption Strip */}
                  <div className="w-full mt-4 pt-3 border-t border-[#222222] flex items-center justify-between text-xs font-ui">
                    <div className="flex items-center gap-1.5 text-[#A3A3A3] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
                      <span suppressHydrationWarning>{formatTimeAgo(grave.buriedAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 font-bold text-[#5CE1FF]">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{grave.viewsCount}</span>
                      </span>
                      <span className="bento-pill text-[9px] py-0.5 px-2 bg-[#121212] text-[#A3A3A3] border-[#262626]">
                        {grave.launchpad.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bento-card p-10 sm:p-14 text-center bg-[#0A0A0A] border-[2px] border-[#222222] max-w-lg mx-auto flex flex-col items-center my-8">
            <div className="w-24 h-24 relative mb-4">
              <Image
                src="/assets/logo.png"
                alt="Empty Graven mascot"
                fill
                sizes="96px"
                className="object-contain"
              />
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl text-white uppercase mb-2">
              NO GRAVES FOUND
            </h2>
            <p className="font-body text-[#A3A3A3] text-sm mb-6 max-w-xs">
              No token memorials matched your filters or search criteria.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setFilter('all');
                  setSearch('');
                }}
                className="btn-bento bg-[#1A1A1A] text-white border border-[#262626] hover:bg-[#222222] text-xs"
              >
                <span>RESET FILTERS</span>
              </button>
              <ButtonLink href="/bury" variant="cyan" size="sm">
                <span>BURY A TOKEN →</span>
              </ButtonLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
