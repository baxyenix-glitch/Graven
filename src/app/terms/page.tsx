import React from 'react';
import Link from 'next/link';
import {
  FileText,
  ArrowLeft,
  Shield,
  Flame,
  Droplets,
  Clock,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  Compass,
} from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { minGravenHold } from '@/lib/chain/config';

export const metadata = {
  title: 'Terms of Service | Graven - Memorial Archive for Dead Coins',
  description:
    'Rules, creator requirements, cryptographic attestation terms, and automated treasury reward policies governing the Graven cemetery on Robinhood Chain.',
};

export default function TermsPage() {
  const highlights = [
    {
      icon: Flame,
      title: `${minGravenHold.toLocaleString()} $GRAVEN GATE`,
      desc: 'Token creators must strictly satisfy the 10,000 $GRAVEN balance gate on Robinhood Chain to execute a burial.',
      color: '#5CE1FF',
    },
    {
      icon: Droplets,
      title: '60 / 30 / 10 REWARD SPLIT',
      desc: 'Accrued visitor rewards are divided 60% creator, 30% verified original holders, and 10% treasury reserve.',
      color: '#E4FF6B',
    },
    {
      icon: Clock,
      title: '5-SECOND ACTIVE DWELL',
      desc: 'Anti-bot qualification strictly enforces active page visibility for 5+ seconds, capped per 24-hour epoch.',
      color: '#FF9CCB',
    },
  ];

  return (
    <div className="w-full bg-[#000000] text-white min-h-[calc(100vh-68px)]">
      {/* 1. BENTO HEADER ROW */}
      <section className="border-b-[3px] border-[#222222] bg-[#000000]">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left label cell */}
          <div className="md:col-span-4 lg:col-span-3 bg-[#0A0A0A] p-6 lg:p-8 border-b-[3px] md:border-b-0 md:border-r-[3px] border-[#222222] flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1237E8] border border-[#222222] text-[11px] font-mono font-bold text-white uppercase mb-3 shadow-[2px_2px_0_#000000]">
                <FileText className="w-3.5 h-3.5 text-[#5CE1FF]" />
                <span>LEGAL SPEC</span>
              </span>
              <h1 className="font-heading text-2xl lg:text-3xl text-white uppercase tracking-tight">
                TERMS OF SERVICE ↗
              </h1>
            </div>
            <div className="mt-4 font-mono text-xs font-bold text-[#A3A3A3] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1DB954]" />
              <span>ROBINHOOD CHAIN PROTOCOL</span>
            </div>
          </div>

          {/* Right description cell */}
          <div className="md:col-span-8 lg:col-span-9 p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#000000]">
            <div className="max-w-2xl">
              <h2 className="font-heading text-2xl lg:text-3xl text-white uppercase mb-2">
                PROTOCOL PARTICIPATION AGREEMENT
              </h2>
              <p className="font-body text-sm sm:text-base text-[#A3A3A3] leading-relaxed">
                Rules, token creator requirements, cryptographic attestation terms, and automated treasury reward policies governing the Graven cemetery.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <ButtonLink
                href="/graves"
                variant="secondary"
                size="sm"
                icon={<Compass className="w-3.5 h-3.5" />}
              >
                ALL GRAVES
              </ButtonLink>
              <ButtonLink
                href="/privacy"
                variant="cyan"
                size="sm"
                icon={<Shield className="w-3.5 h-3.5 text-[#0A0F2E]" />}
              >
                PRIVACY POLICY ↗
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HIGHLIGHT PILLARS BAND */}
      <section className="border-b-[3px] border-[#222222] bg-[#050505]">
        <div className="max-w-[1100px] mx-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {highlights.map((h, i) => {
              const IconComp = h.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-[20px] bg-[#0A0A0A] border-2 border-[#222222] shadow-[3px_3px_0_#000000] flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-[12px] border border-[#333333] flex items-center justify-center bg-[#141414]"
                      style={{ color: h.color }}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="font-ui font-bold text-xs uppercase tracking-wider text-white">
                      {h.title}
                    </span>
                  </div>
                  <p className="font-body text-xs text-[#A3A3A3] leading-relaxed">
                    {h.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. MAIN TERMS CONTENT */}
      <section className="p-6 lg:p-12 max-w-[1000px] mx-auto">
        <div className="bento-card p-6 sm:p-10 bg-[#0A0A0A] border-2 border-[#222222] text-white shadow-[6px_6px_0_#000000]">
          <div className="space-y-10">
            {/* Section 1 */}
            <section className="border-b border-[#222222] pb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-[8px] bg-[#141414] border border-[#262626] text-[#5CE1FF] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  01
                </span>
                <h2 className="font-heading text-xl sm:text-2xl text-white uppercase tracking-tight">
                  PROTOCOL PURPOSE & SCOPE
                </h2>
              </div>
              <p className="font-body text-sm sm:text-base text-[#D4D4D4] leading-[1.8] mb-4">
                Graven (&ldquo;the Protocol&rdquo;) operates as a decentralized digital memorial archive on Robinhood Chain. Graven enables verified token creators to immortalize terminated or expired ERC-20 smart contracts under cryptographic signatures, while distributing community visit rewards to verifiable original holders.
              </p>
              <div className="p-4 bg-[#121212] rounded-[16px] border border-[#262626] text-xs font-mono text-[#A3A3A3] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1DB954] shrink-0 mt-0.5" />
                <span>
                  Graven does not revive abandoned trading contracts; it converts expired projects into enduring digital gravestones with on-chain attribution.
                </span>
              </div>
            </section>

            {/* Section 2 */}
            <section className="border-b border-[#222222] pb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-[8px] bg-[#141414] border border-[#262626] text-[#5CE1FF] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  02
                </span>
                <h2 className="font-heading text-xl sm:text-2xl text-white uppercase tracking-tight">
                  CREATOR ELIGIBILITY & BURIAL RULES
                </h2>
              </div>
              <p className="font-body text-sm sm:text-base text-[#D4D4D4] leading-[1.8] mb-4">
                Only the verified on-chain deployer or launchpad creator of a contract on Robinhood Chain is eligible to execute official burials. Token creators must hold at least {minGravenHold.toLocaleString()} $GRAVEN tokens to pass the holding gate. Epitaphs containing malicious hyperlinks, phishing payloads, harassment, or defamatory speech are strictly prohibited.
              </p>
              <div className="p-4 bg-[#121212] rounded-[16px] border border-[#262626] text-xs font-mono text-[#A3A3A3] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#5CE1FF] shrink-0 mt-0.5" />
                <span>
                  The 10,000 $GRAVEN holding gate acts as a conviction requirement to prevent spam tombs and uphold cemetery quality standards.
                </span>
              </div>
            </section>

            {/* Section 3 */}
            <section className="border-b border-[#222222] pb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-[8px] bg-[#141414] border border-[#262626] text-[#5CE1FF] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  03
                </span>
                <h2 className="font-heading text-xl sm:text-2xl text-white uppercase tracking-tight">
                  REWARDS & TREASURY DISTRIBUTIONS
                </h2>
              </div>
              <p className="font-body text-sm sm:text-base text-[#D4D4D4] leading-[1.8] mb-4">
                Rewards are distributed in Robinhood Chain ETH based on verified qualified visits. Qualified visits require active page visibility for at least 5 seconds and are capped per 24-hour epoch. Rewards follow the protocol ratio: 60% directly to the token creator wallet, 30% proportionally to eligible original holders, and 10% to the automated treasury reserve.
              </p>
              <div className="p-4 bg-[#121212] rounded-[16px] border border-[#262626] text-xs font-mono text-[#A3A3A3] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E4FF6B] shrink-0 mt-0.5" />
                <span>
                  Graven does not guarantee financial returns or investment outcomes. All blockchain operations are final and subject to underlying network gas fees and block confirmations.
                </span>
              </div>
            </section>

            {/* Section 4 */}
            <section className="border-b border-[#222222] pb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-[8px] bg-[#141414] border border-[#262626] text-[#5CE1FF] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  04
                </span>
                <h2 className="font-heading text-xl sm:text-2xl text-white uppercase tracking-tight">
                  HOLDER SNAPSHOTS & ANTI-SYBIL CRITERIA
                </h2>
              </div>
              <p className="font-body text-sm sm:text-base text-[#D4D4D4] leading-[1.8] mb-4">
                Our background snapshot engine identifies early community holders while filtering out known MEV bot clusters, developer wash-trading rings, and sniper addresses. Only genuine community holders are credited for snapshot reward claims.
              </p>
              <div className="p-4 bg-[#121212] rounded-[16px] border border-[#262626] text-xs font-mono text-[#A3A3A3] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#5CE1FF] shrink-0 mt-0.5" />
                <span>
                  Anti-sybil algorithms enforce unique wallet sessions and page visibility requirements to prevent bot farming.
                </span>
              </div>
            </section>

            {/* Section 5 */}
            <section className="border-b border-[#222222] pb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-[8px] bg-[#141414] border border-[#262626] text-[#5CE1FF] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  05
                </span>
                <h2 className="font-heading text-xl sm:text-2xl text-white uppercase tracking-tight">
                  SECOND LIFE & GRADUATION HONORS
                </h2>
              </div>
              <p className="font-body text-sm sm:text-base text-[#D4D4D4] leading-[1.8]">
                Tokens launched on Pons (pons.family) feature bonding curve mechanics. If a token successfully meets its graduation threshold and locks liquidity into decentralized pools, its gravestone is permanently designated as &ldquo;RISEN&rdquo; with perpetual honors on the Graven protocol.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-[8px] bg-[#141414] border border-[#262626] text-[#5CE1FF] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  06
                </span>
                <h2 className="font-heading text-xl sm:text-2xl text-white uppercase tracking-tight">
                  DISCLAIMER OF WARRANTIES & RISK ASSUMPTION
                </h2>
              </div>
              <p className="font-body text-sm sm:text-base text-[#D4D4D4] leading-[1.8] mb-4">
                Graven is provided &ldquo;as is&rdquo; without warranties of any kind, whether express or implied. Users interact with smart contracts, decentralized wallets, and third-party RPC infrastructure entirely at their own risk. The protocol assumes no liability for network outages, wallet misconfigurations, or market volatility.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://x.com/GravendotFun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-bento bg-[#141414] hover:bg-[#1f1f1f] text-white border border-[#262626] text-xs py-2.5 px-4"
                >
                  <span>@GravendotFun on X</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 text-[#5CE1FF]" />
                </a>
                <a
                  href="https://pons.family"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-bento bg-[#141414] hover:bg-[#1f1f1f] text-white border border-[#262626] text-xs py-2.5 px-4"
                >
                  <span>Pons Launchpad ↗</span>
                </a>
              </div>
            </section>
          </div>

          {/* Card Footer Bar */}
          <div className="mt-12 pt-6 border-t-2 border-[#222222] flex flex-col sm:flex-row justify-between items-center gap-4">
            <ButtonLink
              href="/"
              variant="secondary"
              size="sm"
              icon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              BACK TO HOME
            </ButtonLink>

            <div className="flex items-center gap-2 font-mono text-xs text-[#737373]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1DB954] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1DB954]"></span>
              </span>
              <span>LAST PROTOCOL UPDATE: 2026</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
