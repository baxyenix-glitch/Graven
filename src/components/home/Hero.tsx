'use client';

import React from 'react';
import Link from 'next/link';
import { GraveRecord } from '@/lib/db/schemas';

interface HeroProps {
  latestGrave?: GraveRecord | null;
}

export function Hero({ latestGrave }: HeroProps) {
  return (
    <section className="hero-section relative w-full overflow-hidden border-b-[3px] border-[#222222] bg-[#000000]">
      {/* Visually hidden H1 for SEO and screen readers */}
      <h1 className="sr-only">
        Graven: The Bury to Earn Afterlife Protocol For Memecoins, built on Robinhood Chain
      </h1>

      {/* Full-bleed responsive artwork picture */}
      <picture className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
        <source
          media="(min-width: 768px)"
          srcSet="/assets/hero/hero-desktop.webp"
          width={2400}
          height={1350}
        />
        <img
          src="/assets/hero/hero-mobile.webp"
          width={1080}
          height={1920}
          alt="The Bury to Earn Afterlife Protocol For Memecoins. Built on Robinhood Chain."
          loading="eager"
          fetchPriority="high"
          decoding="async"
          sizes="100vw"
          className="w-full h-full object-cover object-top pointer-events-none"
        />
      </picture>

      {/* Centered Small Deep-Blue Bury Button in Sky Zone */}
      <div className="hero-controls">
        <Link
          id="hero-bury-btn"
          href="/bury"
          className="hero-btn-bury-compact"
        >
          <span>BURY A TOKEN ↗</span>
        </Link>
      </div>
    </section>
  );
}
