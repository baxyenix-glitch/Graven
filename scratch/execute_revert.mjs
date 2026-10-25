import fs from 'fs';
import path from 'path';

// 1. Files to delete
const filesToDelete = [
  'src/lib/types/tokens.ts',
  'src/app/buttons/page.tsx',
  'scratch/scan.js',
  'scratch/test_tokens.js',
  'scratch/audit_contrast_all.mjs',
  'scratch/capture_proof.mjs'
];

for (const f of filesToDelete) {
  if (fs.existsSync(f)) {
    fs.rmSync(f, { recursive: true, force: true });
    console.log(`Deleted: ${f}`);
  }
}

// 2. Copy all files from staged_revert to their target locations
const stagedDir = 'scratch/staged_revert';
const files = fs.readdirSync(stagedDir);

for (const sf of files) {
  const targetRel = sf.replace(/__/g, '/');
  const targetFull = path.join(process.cwd(), targetRel);
  const content = fs.readFileSync(path.join(stagedDir, sf), 'utf8');

  fs.mkdirSync(path.dirname(targetFull), { recursive: true });
  fs.writeFileSync(targetFull, content, 'utf8');
  console.log(`Restored: ${targetRel} (${content.length} bytes)`);
}

// 3. Revert Gravestone.tsx specific modifications
const gravePath = 'src/components/grave/Gravestone.tsx';
let graveContent = fs.readFileSync(gravePath, 'utf8');
graveContent = graveContent.replace('bg-[#7FB0FF]/50', 'bg-[#BFD8FF]');
graveContent = graveContent.replace('text-[#0A1FC4]', 'text-[#1237E8]');
graveContent = graveContent.replace('bg-[#7FB0FF]/40', 'bg-[#BFD8FF]');
graveContent = graveContent.replace('data-gravestone-inscription="true"\n        className="absolute z-10 flex flex-col items-center text-center justify-between pointer-events-none gravestone-stone-face"', 'className="absolute z-10 flex flex-col items-center text-center justify-between pointer-events-none"');
graveContent = graveContent.replace('data-gravestone-inscription="true"\r\n        className="absolute z-10 flex flex-col items-center text-center justify-between pointer-events-none gravestone-stone-face"', 'className="absolute z-10 flex flex-col items-center text-center justify-between pointer-events-none"');
fs.writeFileSync(gravePath, graveContent, 'utf8');
console.log('Reverted Gravestone.tsx modifications');

// 4. In Hero.tsx: Ensure it has the full-bleed artwork and compact deep blue button
const heroPath = 'src/components/home/Hero.tsx';
const heroCode = `'use client';

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
`;
fs.writeFileSync(heroPath, heroCode, 'utf8');
console.log('Restored Hero.tsx');

console.log('\n--- ALL PRE-1190 RESTORATION COMPLETED ---');
