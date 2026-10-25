'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GraveRecord, StatsCache } from '@/lib/db/schemas';
import { Hero } from './Hero';
import { StatsBand } from './StatsBand';
import { RecentBurials } from './RecentBurials';
import { AnalyticsSection } from './AnalyticsSection';
import { TimelineAndCTA } from './TimelineAndCTA';

interface HomeLiveViewProps {
  initialGraves: GraveRecord[];
  initialStats: StatsCache;
}

export function HomeLiveView({ initialGraves, initialStats }: HomeLiveViewProps) {
  const [graves, setGraves] = useState<GraveRecord[]>(initialGraves);
  const [stats, setStats] = useState<StatsCache>(initialStats);

  const refreshLiveHome = useCallback(async () => {
    try {
      const [gravesRes, statsRes] = await Promise.all([
        fetch('/api/graves?limit=20', {
          cache: 'no-store',
          signal: AbortSignal.timeout(8000),
        }),
        fetch('/api/stats', {
          cache: 'no-store',
          signal: AbortSignal.timeout(8000),
        }),
      ]);

      if (gravesRes.ok) {
        const gravesData = await gravesRes.json();
        if (Array.isArray(gravesData.graves)) {
          setGraves(gravesData.graves);
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData) {
          setStats(statsData);
        }
      }
    } catch (err) {
      console.warn('Home live polling warning:', err);
    }
  }, []);

  useEffect(() => {
    // Immediate refresh on mount
    refreshLiveHome();

    // Live polling interval every 15 seconds (only when active tab is visible)
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshLiveHome();
      }
    }, 15000);

    // Refresh immediately when user returns to tab
    const handleFocus = () => refreshLiveHome();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshLiveHome();
      }
    };

    // Custom event triggered when user completes a burial
    const handleCustomBurial = () => refreshLiveHome();

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('graven:refresh', handleCustomBurial);
    window.addEventListener('storage', handleCustomBurial);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('graven:refresh', handleCustomBurial);
      window.removeEventListener('storage', handleCustomBurial);
    };
  }, [refreshLiveHome]);

  const latestGrave = graves.length > 0 ? graves[0] : null;

  return (
    <div className="w-full flex flex-col">
      {/* ROW 1: HERO (2-col split, 3px border) */}
      <Hero latestGrave={latestGrave} />

      {/* ROW 2: LIVE STATS BAND (Cobalt label + 6 cream cells + live ticker) */}
      <StatsBand stats={stats} />

      {/* ROW 3: RECENT BURIALS */}
      <section className="w-full border-b-[3px] border-[#222222] bg-[#000000]">
        <RecentBurials graves={graves} />
      </section>

      {/* ROW 4: PROTOCOL ANALYTICS (2/3 Charts + 1/3 Lavender Snapshot) */}
      <AnalyticsSection stats={stats} />

      {/* ROW 5: TIMELINE + CTA (Ice label + white timeline + Cobalt CTA) */}
      <TimelineAndCTA />
    </div>
  );
}
