'use client';

import React from 'react';
import Link from 'next/link';
import {
  Coins,
  Compass,
  ArrowRight,
  Flame,
  Home,
} from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Surface } from '@/components/ui/Surface';

export default function FaucetPage() {
  return (
    <div className="w-full bg-[#F6F4FF]">
      {/* BENTO HEADER ROW */}
      <section className="border-b-[3px] border-[#0A0F2E] bg-white">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left label cell */}
          <div className="md:col-span-4 lg:col-span-3 bg-[#BFD8FF] p-6 lg:p-8 border-b-[3px] md:border-b-0 md:border-r-[3px] border-[#0A0F2E] flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-white border-2 border-[#0A0F2E] text-[11px] font-mono font-bold text-[#0A0F2E] uppercase mb-3">
                PROTOCOL STATUS
              </span>
              <h1 className="font-heading text-2xl lg:text-3xl text-[#0A0F2E] uppercase tracking-tight">
                FAUCET RETIRED ↗
              </h1>
            </div>
            <div className="mt-4 font-mono text-xs font-bold text-[#0A0F2E]/70 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1DB954]" />
              <span>ROBINHOOD CHAIN</span>
            </div>
          </div>

          {/* Right description cell */}
          <div className="md:col-span-8 lg:col-span-9 p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
            <div className="max-w-2xl">
              <h2 className="font-heading text-2xl lg:text-3xl text-[#0A0F2E] uppercase mb-2">
                MAINNET OPERATIONS
              </h2>
              <p className="font-body text-sm text-[#0A0F2E]/75 leading-relaxed">
                Testnet token faucets are no longer active. The Graven protocol operates on Robinhood Chain with permanent on-chain monuments and live community rewards.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <ButtonLink
                href="/graves"
                variant="cyan"
                size="md"
                icon={<Compass className="w-3.5 h-3.5 text-[#0A0F2E]" />}
              >
                BROWSE GRAVES ↗
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <section className="p-6 lg:p-12 max-w-[800px] mx-auto min-h-[50vh] flex items-center justify-center">
        <Surface tone="white" bordered className="bento-card p-8 sm:p-12 text-center max-w-lg w-full">
          <div className="w-16 h-16 rounded-full bg-[#E4FF6B] border-[2.5px] border-[#0A0F2E] flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0_#0A0F2E]">
            <Coins className="w-8 h-8 text-[#0A0F2E]" />
          </div>

          <div className="inline-block px-3.5 py-1 rounded-full bg-[#BFD8FF] border-2 border-[#0A0F2E] text-xs font-mono font-bold uppercase mb-3 text-[#0A0F2E]">
            FEATURE RETIRED
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight mb-3 text-[#0A0F2E]">
            FAUCET NO LONGER ACTIVE
          </h2>

          <p className="font-body text-[#3B4170] text-sm sm:text-base leading-relaxed mb-8">
            The Graven afterlife protocol runs live on Robinhood Chain. $GRAVEN tokens are acquired through decentralized exchanges and active community participation.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <ButtonLink href="/" variant="primary" size="md" icon={<Home className="w-4 h-4" />}>
              RETURN HOME
            </ButtonLink>
            <ButtonLink href="/bury" variant="secondary" size="md" icon={<Flame className="w-4 h-4 text-[#1237E8]" />}>
              BURIAL WIZARD
            </ButtonLink>
          </div>
        </Surface>
      </section>
    </div>
  );
}
