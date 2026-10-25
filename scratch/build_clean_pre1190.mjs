import fs from 'fs';
import readline from 'readline';

const fullLogPath = 'C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\6e9022bc-8bb8-4614-8130-d79a79c44419\\.system_generated\\logs\\transcript_full.jsonl';

// Map of line-indexed files from views between 1195 and 1355
const indexedFiles = {};

function addViewFileContent(content) {
  const m = content.match(/File Path: `file:\/\/\/(.*?)`[\s\S]*?Showing lines (\d+) to (\d+)\r?\nThe following code has been modified[\s\S]*?\r?\n([0-9]+: [\s\S]*)/);
  if (!m) return;
  const filePath = m[1].replace(/\\/g, '/');
  
  let relPath = filePath;
  const marker = 'Graden/';
  const idx = filePath.indexOf(marker);
  if (idx !== -1) {
    relPath = filePath.substring(idx + marker.length);
  }

  if (!indexedFiles[relPath]) {
    indexedFiles[relPath] = [];
  }

  const rawLines = m[4].split('\n');
  for (const line of rawLines) {
    const lineMatch = line.match(/^(\d+): (.*)/);
    if (lineMatch) {
      const lineNum = parseInt(lineMatch[1], 10);
      indexedFiles[relPath][lineNum] = lineMatch[2];
    } else {
      const emptyMatch = line.match(/^(\d+):$/);
      if (emptyMatch) {
        const lineNum = parseInt(emptyMatch[1], 10);
        indexedFiles[relPath][lineNum] = '';
      }
    }
  }
}

async function buildAll() {
  const fileStream = fs.createReadStream(fullLogPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let lineIdx = 0;
  const singleToolFiles = {};
  let line1322Code = null;

  for await (const line of rl) {
    try {
      const obj = JSON.parse(line);
      const tc = obj.tool_calls?.[0];

      if (lineIdx === 950 && tc?.args?.ReplacementContent) {
        singleToolFiles['src/components/layout/Footer.tsx'] = tc.args.ReplacementContent;
      }
      if (lineIdx === 954 && tc?.args?.ReplacementContent) {
        singleToolFiles['src/components/home/StatsBand.tsx'] = tc.args.ReplacementContent;
      }
      if (lineIdx === 1019 && tc?.args?.ReplacementContent) {
        singleToolFiles['src/components/layout/CommandPalette.tsx'] = tc.args.ReplacementContent;
      }
      if (lineIdx === 1037 && tc?.args?.CodeContent) {
        singleToolFiles['src/app/how-it-works/page.tsx'] = tc.args.CodeContent;
      }
      if (lineIdx === 1039 && tc?.args?.CodeContent) {
        singleToolFiles['src/app/dashboard/page.tsx'] = tc.args.CodeContent;
      }
      if (lineIdx === 1045 && tc?.args?.CodeContent) {
        singleToolFiles['src/app/graves/page.tsx'] = tc.args.CodeContent;
      }
      if (lineIdx === 1053 && tc?.args?.CodeContent) {
        singleToolFiles['src/app/leaderboard/page.tsx'] = tc.args.CodeContent;
      }
      if (lineIdx === 1063 && tc?.args?.CodeContent) {
        singleToolFiles['src/app/grave/[address]/page.tsx'] = tc.args.CodeContent;
      }
      if (lineIdx === 1115 && tc?.args?.ReplacementContent) {
        singleToolFiles['src/components/chain/WrongNetworkModal.tsx'] = tc.args.ReplacementContent;
      }

      // Exact targets before edits
      if (lineIdx === 1447 && tc?.args?.TargetContent) {
        singleToolFiles['src/components/home/TopGraves.tsx'] = tc.args.TargetContent;
      }
      if (lineIdx === 1453 && tc?.args?.TargetContent) {
        singleToolFiles['src/components/home/RecentBurials.tsx'] = tc.args.TargetContent;
      }
      if (lineIdx === 1457 && tc?.args?.TargetContent) {
        singleToolFiles['src/components/home/AnalyticsSection.tsx'] = tc.args.TargetContent;
      }
      if (lineIdx === 1461 && tc?.args?.TargetContent) {
        singleToolFiles['src/components/home/AnalyticsCharts.tsx'] = tc.args.TargetContent;
      }
      if (lineIdx === 1465 && tc?.args?.TargetContent) {
        singleToolFiles['src/components/home/TimelineAndCTA.tsx'] = tc.args.TargetContent;
      }
      if (lineIdx === 1491 && tc?.args?.TargetContent) {
        singleToolFiles['src/components/auth/ConnectButton.tsx'] = tc.args.TargetContent;
      }
      if (lineIdx === 1541 && tc?.args?.TargetContent) {
        singleToolFiles['src/components/layout/Navbar.tsx'] = tc.args.TargetContent;
      }

      if (lineIdx === 1322 && tc?.args?.CodeContent) {
        line1322Code = tc.args.CodeContent;
      }

      // Collect view lines
      if (lineIdx >= 1195 && lineIdx <= 1355) {
        if (obj.type === 'VIEW_FILE' && obj.content) {
          addViewFileContent(obj.content);
        }
      }
    } catch (e) {}
    lineIdx++;
  }

  // Assemble files from indexed views
  const assembledFiles = { ...singleToolFiles };
  for (const [relPath, lines] of Object.entries(indexedFiles)) {
    if (['src/components/home/StatsBand.tsx', 'src/components/home/HomeLiveView.tsx', 'scratch/previous_hero.txt', 'src/lib/types/tokens.ts', 'src/app/how-it-works/page.tsx'].includes(relPath)) {
      continue; // already handled with full fidelity above
    }
    if (relPath === 'src/app/bury/page.tsx') {
      // splice lines 151-199 from line1322Code
      const lines1322 = line1322Code.split('\n');
      const middleChunk = lines1322.slice(150, 199); // lines 151 to 199
      for (let i = 0; i < middleChunk.length; i++) {
        lines[151 + i] = middleChunk[i];
      }
      assembledFiles[relPath] = lines.slice(1).join('\n');
    } else {
      assembledFiles[relPath] = lines.slice(1).join('\n');
    }
  }

  // Hero.tsx
  assembledFiles['src/components/home/Hero.tsx'] = `'use client';

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

  // Write all assembled files directly to the codebase
  console.log('\n--- Writing Assembled Pre-1190 Files ---');
  for (const [relPath, content] of Object.entries(assembledFiles)) {
    fs.writeFileSync(relPath, content, 'utf8');
    console.log(`✅ Restored: ${relPath} (${content.split('\n').length} lines, ${content.length} bytes)`);
  }

  // Clean up any extra files
  const toDelete = [
    'src/lib/types/tokens.ts',
    'src/app/buttons/page.tsx',
    'scratch/scan.js',
    'scratch/test_tokens.js',
    'scratch/audit_contrast_all.mjs',
    'scratch/capture_proof.mjs'
  ];
  for (const td of toDelete) {
    if (fs.existsSync(td)) {
      fs.rmSync(td, { recursive: true, force: true });
      console.log(`🗑️ Deleted: ${td}`);
    }
  }

  console.log('\nReversion complete! Ready to build.');
}

buildAll();
