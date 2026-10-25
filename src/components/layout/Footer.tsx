'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ExternalLink,
  Copy,
  Check,
  ArrowUp,
  Flame,
  HelpCircle,
  Compass,
  Trophy,
  LayoutDashboard,
  Droplets,
  FileText,
  Shield,
  ArrowRight,
} from 'lucide-react';
import {
  gravenTokenAddress,
  robinhoodExplorerUrl,
  robinhoodChain,
  isTestnet,
} from '@/lib/chain/config';
import { StarburstSticker } from '@/components/ui/DesignDecorations';

export function Footer() {
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedTreasury, setCopiedTreasury] = useState(false);

  const treasuryAddress =
    process.env.NEXT_PUBLIC_PRIVY_SERVER_WALLET_ADDRESS ||
    '0x000000000000000000000000000000000000dEaD';

  const twitterUrl = process.env.NEXT_PUBLIC_TWITTER_URL;
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL;
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL;

  const copyToClipboard = (text: string, isTreasury: boolean) => {
    navigator.clipboard.writeText(text);
    if (isTreasury) {
      setCopiedTreasury(true);
      setTimeout(() => setCopiedTreasury(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#0A0A0A] border-t-[3px] border-[#222222] rounded-b-[20px] lg:rounded-b-[25px] text-white overflow-hidden relative">
      {/* 1. CTA CELL */}
      <div className="p-6 sm:p-10 lg:p-12 border-b-[3px] border-[#262626] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1237E8] border border-[#3F6EF5] text-[#5CE1FF] font-ui text-[11px] font-bold uppercase mb-3">
            <span>MEMORIAL PROTOCOL</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight leading-[1.05] mb-3">
            YOUR DEAD COIN DESERVES A{' '}
            <span className="inline-block px-3 py-1 rounded-[12px] bg-[#5CE1FF] text-[#0A0F2E] border-[2.5px] border-[#0A0F2E] shadow-[3px_3px_0_#000000]">
              PROPER FUNERAL
            </span>
          </h2>
          <p className="font-body text-[#A3A3A3] text-sm sm:text-base leading-relaxed">
            Honor your expired liquidity. Engrave a permanent cryptographic monument on Robinhood Chain and distribute visitor rewards to original holders.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0 relative z-10">
          <Link href="/bury" className="btn-bento btn-cyan text-xs sm:text-sm py-3 px-6 justify-center">
            <Flame className="w-4 h-4 text-[#0A0F2E]" />
            <span>BURY A TOKEN →</span>
          </Link>
          <Link href="/how-it-works" className="btn-bento btn-ghost bg-[#141414] text-white border-[2px] border-[#262626] text-xs sm:text-sm py-3 px-6 justify-center">
            <HelpCircle className="w-4 h-4 text-[#5CE1FF]" />
            <span>HOW IT WORKS</span>
          </Link>
        </div>

        {/* Decorative Starburst Sticker */}
        <div className="absolute right-4 bottom-2 opacity-15 pointer-events-none hidden sm:block">
          <StarburstSticker className="w-40 h-40" fillColor="#333333" strokeColor="#333333" />
        </div>
      </div>

      {/* 2. FOUR CELLS: Brand, Platform, Resources, Community */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b-[3px] border-[#262626] divide-y-[3px] md:divide-y-0 md:divide-x-[3px] divide-[#262626]">
        {/* Cell 1: Brand */}
        <div className="p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white border-[2px] border-[#222222] flex items-center justify-center relative overflow-hidden shadow-[2px_2px_0_#000000]">
                <Image
                  src="/assets/logo.png"
                  alt="Graven mascot"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <span className="font-ui font-bold text-2xl text-white uppercase tracking-wider">
                GRAVEN
              </span>
            </div>
            <p className="font-body text-[#A3A3A3] text-xs sm:text-sm leading-relaxed mb-6">
              The official afterlife for dead and abandoned tokens on Robinhood Chain. Turning defunct liquidity into verified digital shrines.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1237E8] border border-[#3F6EF5] text-[11px] font-ui text-white w-fit">
            <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
            <span>ROBINHOOD CHAIN MAINNET (ID: 4663)</span>
          </div>
        </div>

        {/* Cell 2: Platform Links */}
        <div className="p-6 lg:p-8">
          <h3 className="font-ui font-bold text-xs text-[#5CE1FF] uppercase mb-4 tracking-wider">
            PLATFORM
          </h3>
          <ul className="space-y-2.5 font-ui text-xs font-bold">
            <li>
              <Link href="/graves" className="text-[#A3A3A3] hover:text-white flex items-center gap-2 transition-colors">
                <Compass className="w-3.5 h-3.5 text-[#5CE1FF]" />
                <span>CEMETERY DIRECTORY</span>
              </Link>
            </li>
            <li>
              <Link href="/bury" className="text-[#A3A3A3] hover:text-white flex items-center gap-2 transition-colors">
                <Flame className="w-3.5 h-3.5 text-[#E4FF6B]" />
                <span>BURY A DEAD TOKEN</span>
              </Link>
            </li>
            <li>
              <Link href="/leaderboard" className="text-[#A3A3A3] hover:text-white flex items-center gap-2 transition-colors">
                <Trophy className="w-3.5 h-3.5 text-[#5CE1FF]" />
                <span>HALL OF HONORED DEAD</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-[#A3A3A3] hover:text-white flex items-center gap-2 transition-colors">
                <LayoutDashboard className="w-3.5 h-3.5 text-[#5CE1FF]" />
                <span>HOLDER & DEV DASHBOARD</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Cell 3: Resources */}
        <div className="p-6 lg:p-8">
          <h3 className="font-ui font-bold text-xs text-[#5CE1FF] uppercase mb-4 tracking-wider">
            RESOURCES
          </h3>
          <ul className="space-y-2.5 font-ui text-xs font-bold">
            <li>
              <Link href="/how-it-works" className="text-[#A3A3A3] hover:text-white flex items-center gap-2 transition-colors">
                <HelpCircle className="w-3.5 h-3.5 text-[#5CE1FF]" />
                <span>HOW IT WORKS GUIDE</span>
              </Link>
            </li>
            <li>
              <a
                href="https://robinhoodchain.blockscout.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A3A3A3] hover:text-white flex items-center gap-2 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#5CE1FF]" />
                <span>ROBINHOOD EXPLORER ↗</span>
              </a>
            </li>
            <li>
              <a
                href="https://pons.family"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A3A3A3] hover:text-white flex items-center gap-2 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#5CE1FF]" />
                <span>PONS LAUNCHPAD ↗</span>
              </a>
            </li>
            <li>
              <Link href="/privacy" className="text-[#A3A3A3] hover:text-white flex items-center gap-2 transition-colors">
                <Shield className="w-3.5 h-3.5 text-[#5CE1FF]" />
                <span>PRIVACY POLICY</span>
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-[#A3A3A3] hover:text-white flex items-center gap-2 transition-colors">
                <FileText className="w-3.5 h-3.5 text-[#5CE1FF]" />
                <span>TERMS OF SERVICE</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Cell 4: Community */}
        <div className="p-6 lg:p-8">
          <h3 className="font-ui font-bold text-xs text-[#5CE1FF] uppercase mb-4 tracking-wider">
            COMMUNITY & CODE
          </h3>
          <p className="font-body text-[#A3A3A3] text-xs mb-4">
            Follow the latest burials, second-life graduations, and protocol governance.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://x.com/GravendotFun"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-icon bg-[#141414] border-[#262626] text-white hover:bg-[#222222]"
              aria-label="X (Twitter)"
            >
              <span className="font-ui font-bold text-sm">𝕏</span>
            </a>
            {telegramUrl && (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-icon bg-[#141414] border-[#262626] text-white hover:bg-[#222222]"
                aria-label="Telegram"
              >
                <span className="font-ui font-bold text-sm">✈</span>
              </a>
            )}
            <a
              href="https://robinhoodchain.blockscout.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-icon bg-[#141414] border-[#262626] text-white hover:bg-[#222222]"
              aria-label="Robinhood Chain Mainnet Explorer"
              title="View on Robinhood Chain Explorer"
            >
              <ExternalLink className="w-4 h-4 text-[#5CE1FF]" />
            </a>
          </div>
        </div>
      </div>

      {/* 3. $GRAVEN Contract Status (Coming Soon) */}
      <div className="border-b-[3px] border-[#262626]">
        <div className="p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-ui font-bold text-[#E4FF6B] uppercase tracking-wider mb-1">
              $GRAVEN PROTOCOL TOKEN
            </div>
            <div className="text-sm font-ui text-[#A3A3A3] flex items-center gap-2">
              <span className="font-mono text-xs text-[#5CE1FF] bg-[#121212] px-3 py-1 rounded-full border border-[#262626]">
                OFFICIAL CONTRACT LAUNCHING TOMORROW
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bento-pill bg-[#141414] text-[#E4FF6B] border-[#262626] text-xs py-2 px-4 font-bold">
              COMING SOON
            </span>
            <a
              href="https://robinhoodchain.blockscout.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-icon bg-[#141414] border-[#262626] text-white hover:bg-[#222222]"
              title="View on Robinhood Chain Explorer"
            >
              <ExternalLink className="w-4 h-4 text-[#5CE1FF]" />
            </a>
          </div>
        </div>
      </div>

      {/* 4. GIANT "GRAVEN" WORDMARK WITH MASCOT */}
      <div className="relative text-center select-none overflow-hidden pt-10 pb-0 border-b-[3px] border-[#262626]">
        <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto -mb-6 relative z-10 animate-float">
          <Image
            src="/assets/logo.png"
            alt="Graven mascot sitting on letters"
            fill
            sizes="(max-width: 768px) 80px, 112px"
            className="object-contain"
          />
        </div>
        <div className="font-heading text-[20vw] sm:text-[18vw] lg:text-[16vw] leading-[0.8] text-[#222222] opacity-80 uppercase tracking-tighter pointer-events-none">
          GRAVEN
        </div>
      </div>

      {/* 5. BOTTOM BAR */}
      <div className="p-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-ui font-bold text-[#A3A3A3]">
        <div className="flex items-center gap-4">
          <span>© 2026 GRAVEN. ALL RIGHTS RESERVED.</span>
          <Link href="/privacy" className="hover:text-white transition-colors">
            PRIVACY
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            TERMS
          </Link>
        </div>

        <button
          type="button"
          onClick={scrollToTop}
          className="btn-icon bg-[#141414] border-[#262626] text-white"
          title="Back to top"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4 text-white" />
        </button>
      </div>
    </footer>
  );
}
