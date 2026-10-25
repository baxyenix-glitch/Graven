'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Flame,
  ShieldCheck,
  ChevronDown,
  Search,
  ArrowUp,
  ArrowRight,
} from 'lucide-react';
import { minGravenHold } from '@/lib/chain/config';
import { Button, ButtonLink } from '@/components/ui/Button';

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const steps = [
    {
      num: '1',
      title: 'CONNECT ON ROBINHOOD CHAIN',
      desc: 'Link your Web3 wallet via Privy. Our smart routing connects you straight to Robinhood Chain with WalletConnect and deep link compatibility for all phone wallets.',
    },
    {
      num: '2',
      title: 'PROVE YOU ARE THE CREATOR',
      desc: 'Our backend independently verifies on-chain creator records from Pons (pons.family) contracts or creation transactions. Only verified creators can bury their coins.',
    },
    {
      num: '3',
      title: 'HOLD 10,000 $GRAVEN',
      desc: `Burial requires holding at least ${minGravenHold.toLocaleString()} $GRAVEN tokens in your wallet to verify creator conviction and prevent spam.`,
    },
    {
      num: '4',
      title: 'SIGN YOUR EPITAPH',
      desc: 'Write a memorial epitaph (max 140 characters). The server generates an attestation message with a single-use nonce that you cryptographically sign using personal_sign.',
    },
    {
      num: '5',
      title: 'ETERNAL TOMB IS ENGRAVED',
      desc: 'The memorial stone is permanently generated. Our background worker computes the original holder snapshot, excluding snipers, dev transfer clusters, and wash wallets.',
    },
    {
      num: '6',
      title: 'VISITORS UNLOCK ETH REWARDS',
      desc: 'Original buyers and community members visit the gravestone for 5+ seconds. Qualified views generate real ETH split 60% to creator, 30% to holders, and 10% to treasury.',
    },
  ];

  const faqs = [
    {
      q: 'Why does Graven exist?',
      a: 'In crypto, 99% of meme coins and microcap tokens expire or run out of liquidity. Rather than letting them vanish as empty contracts, Graven transforms dead coins into permanent digital monuments that reward original holders.',
    },
    {
      q: 'How does the 60/30/10 reward split work?',
      a: 'Whenever a qualified visitor dwells on a grave for at least 5 seconds, the protocol records a verified visit. The reward value (0.0005 ETH default) is accrued: 60% directly to the token creator wallet, 30% proportionally to eligible original holders, and 10% to the treasury.',
    },
    {
      q: 'What qualifies a view?',
      a: 'To prevent bot fraud and view farming: (1) Visitor must connect a wallet on Robinhood Chain, (2) Must be an eligible original holder or creator, (3) Page must be active and visible for 5+ seconds, and (4) Maximum 1 qualified visit per wallet per grave every 24 hours.',
    },
    {
      q: 'What is the Second Life pathway?',
      a: 'Tokens launched on Pons (pons.family) feature bonding curve mechanics. If a token meets its graduation threshold and locks liquidity into decentralized pools, its gravestone is marked as "RISEN" with perpetual honors.',
    },
    {
      q: 'Where do the payout funds come from?',
      a: 'Payouts are executed on Robinhood Chain directly from the automated protocol treasury reserve.',
    },
  ];

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#000000] text-white">
      {/* BENTO HEADER ROW */}
      <section className="border-b-[3px] border-[#222222] bg-[#000000]">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left label cell */}
          <div className="md:col-span-4 lg:col-span-3 p-6 lg:p-8 border-b-[3px] md:border-b-0 md:border-r-[3px] border-[#222222] bg-[#0A0A0A] flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#1237E8] border border-[#222222] text-[11px] font-mono font-bold text-white uppercase mb-3">
                PROTOCOL GUIDE
              </span>
              <h1 className="font-heading text-2xl lg:text-3xl text-white uppercase tracking-tight">
                HOW IT WORKS ↗
              </h1>
            </div>
            <div className="mt-4 font-mono text-xs font-bold text-[#A3A3A3] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#5CE1FF]" />
              <span>STEP-BY-STEP SPEC</span>
            </div>
          </div>

          {/* Right description cell */}
          <div className="md:col-span-8 lg:col-span-9 p-6 lg:p-8 bg-[#000000] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="font-heading text-2xl lg:text-3xl text-white uppercase mb-2">
                AFTERLIFE MECHANICS
              </h2>
              <p className="font-body text-sm text-[#A3A3A3] leading-relaxed">
                Everything you need to know about laying dead coins to rest, anti-sybil holder snapshot verifications, and automated ETH reward distributions on Robinhood Chain.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <ButtonLink
                href="/bury"
                variant="cyan"
                size="md"
                icon={<Flame className="w-4 h-4 text-[#0A0F2E]" />}
              >
                BURY A TOKEN ↗
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ACTION QUICK LINKS TOOLBAR */}
      <section className="border-b-[3px] border-[#222222] bg-[#0A0A0A] px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <ButtonLink href="/graves" variant="secondary" size="sm" icon={<Search className="w-3.5 h-3.5" />}>
            SEARCH A GRAVE
          </ButtonLink>
          <ButtonLink href="/bury" variant="secondary" size="sm" icon={<Flame className="w-3.5 h-3.5 text-[#5CE1FF]" />}>
            BURY A TOKEN
          </ButtonLink>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={scrollToTop}
          icon={<ArrowUp className="w-3.5 h-3.5" />}
          className="border border-[#262626] text-xs text-white hover:bg-white/10"
        >
          BACK TO TOP
        </Button>
      </section>

      {/* MAIN CONTAINER */}
      <section className="p-4 sm:p-6 lg:p-10 max-w-[1240px] mx-auto bg-[#000000]">
        {/* 6 STEPS BREAKDOWN */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="px-3 py-1 rounded-full bg-[#1237E8] text-white text-xs font-mono font-bold uppercase border border-[#222222]">
              WORKFLOW
            </span>
            <h2 className="font-heading text-2xl uppercase tracking-tight text-white">
              THE 6-STEP BURIAL PIPELINE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="bento-card p-6 sm:p-8 flex flex-col justify-between bg-[#0A0A0A] border-[2px] border-[#222222] hover:-translate-y-1 transition-transform"
              >
                <div>
                  <div className="w-12 h-12 rounded-[14px] bg-[#1237E8] border-[2px] border-[#222222] flex items-center justify-center font-heading text-xl text-white mb-5 shadow-[3px_3px_0_#000000]">
                    {s.num}
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl uppercase tracking-tight leading-tight mb-3 text-white">
                    {s.title}
                  </h3>
                  <p className="font-body text-sm sm:text-base text-[#A3A3A3] leading-[1.65]">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REWARD SPLIT & ANTI-SYBIL PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Reward Split Card */}
          <div
            className="lg:col-span-6 bento-card p-6 sm:p-8 flex flex-col justify-between bg-[#0A0A0A] border-[2px] border-[#222222]"
          >
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-[#E4FF6B] text-[#0A0F2E] text-xs font-mono font-bold uppercase mb-4 border border-[#0A0F2E]">
                TOKENOMICS
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl uppercase leading-tight text-white mb-3">
                THE 60 / 30 / 10 SPLIT
              </h2>
              <p className="font-body text-sm sm:text-base text-[#A3A3A3] leading-[1.65] mb-6">
                When a verified holder visits a memorial, real ETH is distributed automatically through the double-entry ledger.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 bg-[#121212] rounded-[16px] border border-[#262626] flex items-center justify-between">
                  <span className="text-white font-bold">CREATOR SHARE:</span>
                  <span className="font-bold text-[#E4FF6B] text-base">60%</span>
                </div>
                <div className="p-3.5 bg-[#121212] rounded-[16px] border border-[#262626] flex items-center justify-between">
                  <span className="text-white font-bold">ORIGINAL HOLDERS SHARE:</span>
                  <span className="font-bold text-[#5CE1FF] text-base">30%</span>
                </div>
                <div className="p-3.5 bg-[#121212] rounded-[16px] border border-[#262626] flex items-center justify-between">
                  <span className="text-white font-bold">PROTOCOL MAINTENANCE:</span>
                  <span className="font-bold text-white text-base">10%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#222222] text-xs font-mono text-[#737373]">
              Enforced by append-only ledger math and daily payout limits.
            </div>
          </div>

          {/* Anti-Sybil Integrity Card */}
          <div
            className="lg:col-span-6 bento-card p-6 sm:p-8 flex flex-col justify-between bg-[#0A0A0A] border-[2px] border-[#222222]"
          >
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-[#1237E8] border border-[#222222] text-xs font-mono font-bold uppercase mb-4 text-white">
                INTEGRITY
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl uppercase leading-tight text-white mb-3">
                ANTI-SYBIL HOLDER SNAPSHOTS
              </h2>
              <p className="font-body text-sm sm:text-base text-[#A3A3A3] leading-[1.65] mb-6">
                Not all wallet addresses are eligible for rewards. Our historical log analyzer strictly purges bad actors:
              </p>

              <ul className="space-y-2.5 text-xs font-mono text-[#D4D4D4] list-disc pl-5">
                <li>Creator wallets and creator funding trees are filtered from holder pool.</li>
                <li>Wallets funded within 2 hops of the dev are flagged and excluded.</li>
                <li>Addresses that only received tokens via dev transfers are ineligible.</li>
                <li>Sniper bot bundles sharing identical transaction origins are barred.</li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-[#222222] flex items-center gap-2 text-xs font-mono font-bold text-[#1DB954]">
              <ShieldCheck className="w-4 h-4 text-[#1DB954]" />
              <span>Fair rewards for genuine community holders</span>
            </div>
          </div>
        </div>

        {/* FAQ ACCORDIONS */}
        <div className="bento-card p-6 sm:p-10 mb-12 bg-[#0A0A0A] border-[2px] border-[#222222]">
          <div className="flex items-center gap-2 mb-6">
            <span className="px-3 py-1 rounded-full bg-[#1237E8] border border-[#222222] text-xs font-mono font-bold uppercase text-white">
              QUESTIONS
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl uppercase tracking-tight text-white">
              FREQUENTLY ASKED QUESTIONS
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border-[2px] border-[#262626] rounded-[18px] overflow-hidden transition-all shadow-[2px_2px_0_#000000] bg-[#121212]"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                  className="w-full p-4 sm:p-5 text-left font-heading text-base sm:text-lg uppercase flex items-center justify-between bg-[#121212] hover:bg-[#1A1A1A] transition-colors cursor-pointer touch-manipulation"
                >
                  <span className="text-white font-bold">{faq.q}</span>
                  <div className="w-8 h-8 rounded-full border border-[#333333] bg-[#1A1A1A] flex items-center justify-center shrink-0 ml-4 shadow-[1px_1px_0_#000000]">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openFaq === idx ? 'rotate-180 text-[#5CE1FF]' : 'text-white'
                      }`}
                    />
                  </div>
                </button>

                {openFaq === idx && (
                  <div className="p-5 sm:p-6 bg-[#0E0E0E] text-sm sm:text-base font-body text-[#D4D4D4] leading-[1.65] border-t border-[#262626] animate-in fade-in duration-150">
                    <p className="text-[#D4D4D4] font-medium mb-3">{faq.a}</p>
                    <div className="text-xs font-mono text-[#737373] pt-2 border-t border-[#222222]">
                      Robinhood Chain • Verified Protocol Architecture
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA CELL */}
        <div className="bento-card p-8 sm:p-12 text-center text-white bg-gradient-to-br from-[#1237E8] to-[#0A1FC4] border-[2px] border-[#222222]">
          <h2 className="font-heading text-3xl sm:text-4xl uppercase mb-3 text-white">
            READY TO LAY YOUR COIN TO REST?
          </h2>
          <p className="font-body text-base text-[#D6DDFF] max-w-lg mx-auto mb-8 leading-[1.65]">
            Give your community a permanent on-chain monument and turn abandoned liquidity into active rewards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ButtonLink
              href="/bury"
              variant="cyan"
              size="lg"
              icon={<Flame className="w-4 h-4 text-[#0A0F2E]" />}
            >
              BURY A TOKEN ↗
            </ButtonLink>
            <ButtonLink
              href="/graves"
              variant="secondary"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              BROWSE ALL GRAVES
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
