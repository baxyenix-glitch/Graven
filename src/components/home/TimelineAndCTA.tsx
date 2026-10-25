'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, HelpCircle } from 'lucide-react';
import { StarburstSticker } from '@/components/ui/DesignDecorations';

export function TimelineAndCTA() {
  const steps = [
    {
      num: '1',
      title: 'CONNECT ON ROBINHOOD CHAIN',
      desc: 'Link your Web3 wallet via Privy with instant chain routing.',
    },
    {
      num: '2',
      title: 'PROVE YOU LAUNCHED IT',
      desc: 'Engine verifies on-chain creator records from Pons or creation transactions.',
    },
    {
      num: '3',
      title: 'HOLD 10K $GRAVEN',
      desc: 'Hold 10,000 $GRAVEN to unlock solemn burial privileges.',
    },
    {
      num: '4',
      title: 'SIGN YOUR EPITAPH',
      desc: 'Craft a memorial epitaph and sign the single-use attestation nonce.',
    },
    {
      num: '5',
      title: 'YOUR GRAVE GOES LIVE',
      desc: 'The monument is engraved into the permanent digital cemetery.',
    },
    {
      num: '6',
      title: 'HOLDERS VISIT & EARN',
      desc: 'Original buyers visit for 5+ seconds and earn proportional ETH rewards.',
    },
  ];

  return (
    <section className="w-full bg-[#000000]">
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y-[3px] lg:divide-y-0 lg:divide-x-[3px] divide-[#222222] items-stretch">
        {/* =========================================================================
            LEFT WIDE SECTION (8 cols): Ice Label Cell + Dark Timeline Cell
           ========================================================================= */}
        <div className="lg:col-span-8 flex flex-col lg:flex-row items-stretch divide-y-[3px] lg:divide-y-0 lg:divide-x-[3px] divide-[#222222]">
          {/* Narrow Solid Label Cell */}
          <div className="bg-[#0A0A0A] text-white p-6 lg:p-8 shrink-0 flex items-center justify-between lg:flex-col lg:justify-center lg:items-start lg:w-48">
            <div>
              <div className="bento-pill bg-[#1237E8] text-white border-[#222222] mb-2">
                6 STEPS
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl uppercase tracking-tight text-white leading-none">
                HOW IT WORKS →
              </h2>
            </div>
            <div className="hidden lg:flex mt-4 w-9 h-9 rounded-[10px] bg-[#121212] text-white border-[2px] border-[#222222] shadow-[2px_2px_0_#000000] items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Dark Timeline Cell */}
          <div className="p-6 sm:p-8 lg:p-10 flex-1 flex flex-col justify-between bg-[#000000] text-white">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-3 border-b-[2px] border-[#222222]">
                <span className="font-ui font-bold text-xs uppercase tracking-wider text-[#A3A3A3]">
                  TOKEN BURIAL & REWARDS LIFECYCLE
                </span>
                <Link
                  href="/how-it-works"
                  className="font-ui text-xs font-bold text-[#5CE1FF] hover:underline flex items-center gap-1"
                >
                  <span>FULL GUIDE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Vertical Timeline with straight line */}
              <div className="relative pl-2 sm:pl-4 space-y-6">
                {/* Straight dashed line */}
                <div className="absolute left-[21px] sm:left-[29px] top-4 bottom-4 w-0.5 border-l-2 border-dashed border-[#262626] -z-0" />

                {steps.map((s, idx) => (
                  <div key={idx} className="relative flex items-start gap-3.5 sm:gap-4 z-10">
                    {/* Round Numbered Dot */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1237E8] border-[2.5px] border-[#000000] shadow-[2px_2px_0_#000000] flex items-center justify-center font-heading text-sm sm:text-base text-white shrink-0">
                      {s.num}
                    </div>

                    <div className="pt-0.5">
                      <h3 className="font-heading text-base sm:text-lg text-white uppercase tracking-wide leading-tight mb-0.5">
                        {s.title}
                      </h3>
                      <p className="font-body text-xs sm:text-sm text-[#A3A3A3] max-w-md leading-relaxed font-normal">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t-[2px] border-[#222222] flex justify-end">
              <Link href="/how-it-works" className="btn-bento bg-[#121212] text-white border-[2px] border-[#262626] hover:bg-[#1E1E1E] text-xs">
                <HelpCircle className="w-3.5 h-3.5 mr-1 text-[#5CE1FF]" />
                <span>READ THE FULL GUIDE →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT CTA CELL (Cobalt to Deep Royal, Starburst sticker, 4 cols)
           ========================================================================= */}
        <div className="lg:col-span-4 bg-[#1237E8] text-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Starburst Sticker in background */}
          <div className="absolute -top-6 -right-6 pointer-events-none opacity-20">
            <StarburstSticker className="w-44 h-44" fillColor="#5CE1FF" strokeColor="#0A0F2E" strokeWidth={3} />
          </div>

          <div className="relative z-10">
            <div className="bento-pill bg-[#E4FF6B] text-[#0A0F2E] mb-6 w-fit border-[#0A0F2E]">
              START BURIAL
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight leading-[1.05] mb-4 text-white">
              READY TO LAY YOUR COIN TO REST?
            </h2>

            <p className="font-body text-[#BFD8FF] text-sm sm:text-base leading-relaxed mb-8">
              Join token creators turning defunct and abandoned projects into immortal digital monuments with continuous community rewards.
            </p>
          </div>

          <div className="relative z-10">
            <Link
              href="/bury"
              className="w-full btn-bento btn-cyan text-sm sm:text-base py-3.5 justify-center"
            >
              <Flame className="w-4 h-4 text-[#0A0F2E]" />
              <span>BURY A TOKEN →</span>
            </Link>

            <div className="mt-4 text-center text-[11px] font-ui text-[#BFD8FF]/70">
              Robinhood Chain • Zero Gas Gimmicks
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}