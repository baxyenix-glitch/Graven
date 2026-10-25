'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Eye, Coins, Flame, Loader2, Calendar } from 'lucide-react';
import { GraveRecord } from '@/lib/db/schemas';
import { robinhoodExplorerUrl } from '@/lib/chain/config';
import { ButtonLink } from '@/components/ui/Button';

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'graves' | 'devs' | 'recent'>('graves');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topGraves, setTopGraves] = useState<GraveRecord[]>([]);
  const [topDevs, setTopDevs] = useState<any[]>([]);
  const [recentlyBuried, setRecentlyBuried] = useState<GraveRecord[]>([]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/leaderboard', { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const data = await res.json();
        setTopGraves(data.topGraves || []);
        setTopDevs(data.topDevs || []);
        setRecentlyBuried(data.recentlyBuried || []);
      } else {
        setError('Failed to fetch leaderboard data.');
      }
    } catch (err: any) {
      console.warn('Leaderboard fetch error:', err);
      setError(err?.name === 'TimeoutError' ? 'Leaderboard request timed out after 8s.' : 'Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const rankColors = ['bg-[#1237E8] text-white', 'bg-[#1DB954] text-white', 'bg-[#5CE1FF] text-[#0A0F2E]'];

  return (
    <div className="w-full bg-[#000000] text-white">
      {/* BENTO HEADER ROW */}
      <section className="border-b-[3px] border-[#222222] bg-[#000000]">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left label cell */}
          <div className="md:col-span-4 lg:col-span-3 bg-[#0A0A0A] p-6 lg:p-8 border-b-[3px] md:border-b-0 md:border-r-[3px] border-[#222222] flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#1237E8] border border-[#222222] text-[11px] font-mono font-bold text-white uppercase mb-3">
                HALL OF MEMORY
              </span>
              <h1 className="font-heading text-2xl lg:text-3xl text-white uppercase tracking-tight">
                LEADERBOARDS ↗
              </h1>
            </div>
            <div className="mt-4 font-mono text-xs font-bold text-[#A3A3A3] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#5CE1FF]" />
              <span>TOP HONORED DEAD</span>
            </div>
          </div>

          {/* Right description cell */}
          <div className="md:col-span-8 lg:col-span-9 p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#000000]">
            <div className="max-w-2xl">
              <h2 className="font-heading text-2xl lg:text-3xl text-white uppercase mb-2">
                GRAVEN LEADERBOARDS
              </h2>
              <p className="font-body text-sm text-[#A3A3A3] leading-relaxed">
                Celebrating the most revered memorials and successful afterlife creators on Robinhood Chain. Original holders of top memorials earn ongoing qualified visit rewards.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <ButtonLink
                href="/bury"
                variant="cyan"
                size="md"
                icon={<Flame className="w-3.5 h-3.5 text-[#0A0F2E]" />}
              >
                BURY A TOKEN ↗
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* TOOLBAR TABS CELL */}
      <section className="border-b-[3px] border-[#222222] bg-[#0A0A0A] p-4 sm:p-6 px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setTab('graves')}
            className={`btn-bento text-xs py-2.5 px-4 transition-all cursor-pointer ${
              tab === 'graves'
                ? 'bg-[#1237E8] text-white border-[#222222]'
                : 'bg-[#121212] text-[#A3A3A3] hover:text-white border-[#262626]'
            }`}
          >
            <Eye className="w-3.5 h-3.5 mr-1.5 inline text-[#5CE1FF]" />
            <span>TOP GRAVES (QUALIFIED VIEWS)</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('devs')}
            className={`btn-bento text-xs py-2.5 px-4 transition-all cursor-pointer ${
              tab === 'devs'
                ? 'bg-[#1237E8] text-white border-[#222222]'
                : 'bg-[#121212] text-[#A3A3A3] hover:text-white border-[#262626]'
            }`}
          >
            <Coins className="w-3.5 h-3.5 mr-1.5 inline text-[#E4FF6B]" />
            <span>TOP CREATORS (ETH EARNED)</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('recent')}
            className={`btn-bento text-xs py-2.5 px-4 transition-all cursor-pointer ${
              tab === 'recent'
                ? 'bg-[#1237E8] text-white border-[#222222]'
                : 'bg-[#121212] text-[#A3A3A3] hover:text-white border-[#262626]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5 inline text-[#5CE1FF]" />
            <span>RECENTLY BURIED</span>
          </button>
        </div>
      </section>

      {/* LEADERBOARD LIST ROWS */}
      <section className="p-6 lg:p-10 max-w-[1100px] mx-auto bg-[#000000]">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#5CE1FF] mb-4" />
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">
              Tallying on-chain visits...
            </p>
          </div>
        ) : error ? (
          <div className="bento-card p-8 sm:p-12 text-center bg-[#0A0A0A] border-[2px] border-[#FF3B30]/40 max-w-lg mx-auto flex flex-col items-center my-8">
            <h2 className="font-heading text-xl sm:text-2xl text-[#FF3B30] uppercase mb-2">
              FAILED TO LOAD LEADERBOARDS
            </h2>
            <p className="font-body text-[#A3A3A3] text-sm mb-6 max-w-xs">
              {error}
            </p>
            <button
              type="button"
              onClick={fetchLeaderboard}
              className="btn-bento btn-cobalt text-xs py-2 px-6"
            >
              <span>RETRY</span>
            </button>
          </div>
        ) : tab === 'graves' ? (
          <div className="space-y-4">
            {topGraves.length > 0 ? (
              topGraves.map((grave, idx) => (
                <Link
                  key={grave.tokenAddress}
                  href={`/grave/${grave.tokenAddress}`}
                  className="block group"
                >
                  <div className="bento-card p-4 sm:p-5 bg-[#0A0A0A] border-[2px] border-[#222222] flex items-center justify-between group-hover:-translate-y-0.5 transition-transform">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div
                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full ${
                          rankColors[idx] || 'bg-[#1A1A1A] text-white'
                        } border-[2px] border-[#222222] flex items-center justify-center font-heading text-sm sm:text-base shrink-0 shadow-[2px_2px_0_#000000]`}
                      >
                        #{idx + 1}
                      </div>

                      <div className="w-11 h-11 rounded-full border border-[#262626] overflow-hidden relative shrink-0 bg-[#121212] flex items-center justify-center font-ui font-bold text-xs text-white">
                        {grave.logoUrl && grave.logoUrl !== '/assets/logo.png' ? (
                          <Image
                            src={grave.logoUrl}
                            alt={grave.name}
                            fill
                            sizes="44px"
                            className="object-contain"
                          />
                        ) : (
                          <span>{grave.symbol?.slice(0, 3) || 'RIP'}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading text-base sm:text-lg uppercase truncate group-hover:text-[#5CE1FF] text-white">
                            {grave.name}
                          </h3>
                          <span className="font-mono font-bold text-xs text-[#A3A3A3]">
                            ${grave.symbol}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-[#737373] truncate">
                          {grave.tokenAddress}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-heading text-xl sm:text-2xl text-[#5CE1FF] leading-none">
                        {grave.qualifiedViewsCount}
                      </div>
                      <div className="text-[10px] font-mono font-bold text-[#A3A3A3] uppercase mt-0.5">
                        QUALIFIED VISITS
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="bento-card p-10 text-center bg-[#0A0A0A] border-[2px] border-[#222222] text-sm font-mono text-[#A3A3A3]">
                No graves recorded in the rankings yet.
              </div>
            )}
          </div>
        ) : tab === 'devs' ? (
          <div className="space-y-4">
            {topDevs.length > 0 ? (
              topDevs.map((dev, idx) => (
                <a
                  key={dev.wallet}
                  href={`${robinhoodExplorerUrl}/address/${dev.wallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="bento-card p-4 sm:p-5 bg-[#0A0A0A] border-[2px] border-[#222222] flex items-center justify-between group-hover:-translate-y-0.5 transition-transform">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div
                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full ${
                          rankColors[idx] || 'bg-[#1A1A1A] text-white'
                        } border-[2px] border-[#222222] flex items-center justify-center font-heading text-sm sm:text-base shrink-0 shadow-[2px_2px_0_#000000]`}
                      >
                        #{idx + 1}
                      </div>

                      <div>
                        <div className="font-mono font-bold text-sm sm:text-base text-white group-hover:text-[#5CE1FF]">
                          {dev.wallet.slice(0, 10)}...{dev.wallet.slice(-8)}
                        </div>
                        <div className="text-xs font-mono text-[#A3A3A3]">
                          {dev.gravesCount} token(s) buried
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-heading text-xl sm:text-2xl text-[#1DB954] leading-none">
                        {dev.totalEth.toFixed(4)} ETH
                      </div>
                      <div className="text-[10px] font-mono font-bold text-[#A3A3A3] uppercase mt-0.5">
                        TOTAL ETH EARNED
                      </div>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <div className="bento-card p-10 text-center bg-[#0A0A0A] border-[2px] border-[#222222] text-sm font-mono text-[#A3A3A3]">
                No creator earnings recorded yet.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {recentlyBuried.length > 0 ? (
              recentlyBuried.map((grave) => (
                <Link
                  key={grave.tokenAddress}
                  href={`/grave/${grave.tokenAddress}`}
                  className="block group"
                >
                  <div className="bento-card p-4 sm:p-5 bg-[#0A0A0A] border-[2px] border-[#222222] flex items-center justify-between group-hover:-translate-y-0.5 transition-transform">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-full border border-[#262626] overflow-hidden relative shrink-0 bg-[#121212] flex items-center justify-center font-ui font-bold text-xs text-white">
                        {grave.logoUrl && grave.logoUrl !== '/assets/logo.png' ? (
                          <Image
                            src={grave.logoUrl}
                            alt={grave.name}
                            fill
                            sizes="44px"
                            className="object-contain"
                          />
                        ) : (
                          <span>{grave.symbol?.slice(0, 3) || 'RIP'}</span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-heading text-base sm:text-lg uppercase truncate group-hover:text-[#5CE1FF] text-white">
                          {grave.name} (${grave.symbol})
                        </h3>
                        <div className="text-xs font-mono text-[#A3A3A3]">
                          Buried on {grave.buriedAt.slice(0, 10)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-3 py-1 rounded-full bg-[#121212] border border-[#262626] text-xs font-mono font-bold uppercase text-[#5CE1FF]">
                        {grave.launchpad}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="bento-card p-10 text-center bg-[#0A0A0A] border-[2px] border-[#222222] text-sm font-mono text-[#A3A3A3]">
                No recent burials logged.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
