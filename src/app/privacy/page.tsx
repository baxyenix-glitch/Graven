import React from 'react';
import Link from 'next/link';
import {
  Shield,
  ArrowLeft,
  FileText,
  Lock,
  EyeOff,
  Database,
  CheckCircle2,
  ExternalLink,
  Compass,
} from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';

export const metadata = {
  title: 'Privacy Policy | Graven - Memorial Archive for Dead Coins',
  description:
    'Principles of minimal data retention, public on-chain transparency, and secure cryptographic wallet authentication for Graven on Robinhood Chain.',
};

export default function PrivacyPage() {
  const highlights = [
    {
      icon: EyeOff,
      title: 'ZERO TRACKING & PROFILING',
      desc: 'No email databases, tracking cookies, advertising pixels, or real-world identity profiling.',
      color: '#5CE1FF',
    },
    {
      icon: Lock,
      title: 'CRYPTOGRAPHIC AUTH',
      desc: 'Privy-authenticated sessions signed via cryptographic keys. No centralized passwords.',
      color: '#E4FF6B',
    },
    {
      icon: Database,
      title: 'PUBLIC IMMUTABLE LEDGER',
      desc: 'Burials and rewards are executed on Robinhood Chain Mainnet and publicly verifiable.',
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
                <Shield className="w-3.5 h-3.5 text-[#5CE1FF]" />
                <span>DATA SPEC</span>
              </span>
              <h1 className="font-heading text-2xl lg:text-3xl text-white uppercase tracking-tight">
                PRIVACY POLICY ↗
              </h1>
            </div>
            <div className="mt-4 font-mono text-xs font-bold text-[#A3A3A3] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1DB954]" />
              <span>ON-CHAIN GOVERNANCE</span>
            </div>
          </div>

          {/* Right description cell */}
          <div className="md:col-span-8 lg:col-span-9 p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#000000]">
            <div className="max-w-2xl">
              <h2 className="font-heading text-2xl lg:text-3xl text-white uppercase mb-2">
                IMMUTABLE WEB3 PRIVACY
              </h2>
              <p className="font-body text-sm sm:text-base text-[#A3A3A3] leading-relaxed">
                Principles of minimal data retention, public on-chain transparency, and secure cryptographic wallet authentication for Graven on Robinhood Chain.
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
                href="/terms"
                variant="cyan"
                size="sm"
                icon={<FileText className="w-3.5 h-3.5 text-[#0A0F2E]" />}
              >
                TERMS SPEC ↗
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

      {/* 3. MAIN POLICY CONTENT */}
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
                  MINIMAL DATA COLLECTION
                </h2>
              </div>
              <p className="font-body text-sm sm:text-base text-[#D4D4D4] leading-[1.8] mb-4">
                Graven respects Web3 privacy principles. We do not maintain user email databases, collect real-world personal identifying information (PII), or deploy invasive behavioral trackers. Interactions are anchored to public wallet addresses and on-chain smart contract transactions.
              </p>
              <div className="p-4 bg-[#121212] rounded-[16px] border border-[#262626] text-xs font-mono text-[#A3A3A3] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1DB954] shrink-0 mt-0.5" />
                <span>
                  No email registration, no phone numbers, and no KYC documents are required to browse, visit graves, or claim eligible visitor rewards.
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
                  ON-CHAIN TRANSPARENCY
                </h2>
              </div>
              <p className="font-body text-sm sm:text-base text-[#D4D4D4] leading-[1.8] mb-4">
                All contract addresses, creator signatures, burial timestamps, and payout transactions are recorded publicly on Robinhood Chain and indexed via decentralized block explorers. Public blockchain data cannot be erased, edited, or suppressed.
              </p>
              <div className="p-4 bg-[#121212] rounded-[16px] border border-[#262626] text-xs font-mono text-[#A3A3A3] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#5CE1FF] shrink-0 mt-0.5" />
                <span>
                  Every tombstone is verifiable by checking the creator cryptographic challenge signature directly on-chain.
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
                  LOCAL STORAGE & AUTHENTICATION
                </h2>
              </div>
              <p className="font-body text-sm sm:text-base text-[#D4D4D4] leading-[1.8] mb-4">
                Wallet connection sessions are managed securely through Privy cryptographic tokens stored in local client sessions. In-memory rate limiting and timing tokens are used strictly to safeguard against automated sybil attacks and protect reward liquidity.
              </p>
              <div className="p-4 bg-[#121212] rounded-[16px] border border-[#262626] text-xs font-mono text-[#A3A3A3] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#E4FF6B] shrink-0 mt-0.5" />
                <span>
                  Local storage keys store temporary visitor dwell timers and burial timestamps to optimize app responsiveness without remote surveillance.
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
                  SMART CONTRACT & RPC INTERACTIONS
                </h2>
              </div>
              <p className="font-body text-sm sm:text-base text-[#D4D4D4] leading-[1.8]">
                When interacting with the Graven protocol, transactions are broadcasted to Robinhood Chain RPC endpoints. Node providers process standard network transmission parameters in accordance with Ethereum JSON-RPC specifications. Graven does not sell, broker, or monetize RPC logs.
              </p>
            </section>

            {/* Section 5 */}
            <section className="border-b border-[#222222] pb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-[8px] bg-[#141414] border border-[#262626] text-[#5CE1FF] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  05
                </span>
                <h2 className="font-heading text-xl sm:text-2xl text-white uppercase tracking-tight">
                  USER AUTONOMY & DISCONNECT
                </h2>
              </div>
              <p className="font-body text-sm sm:text-base text-[#D4D4D4] leading-[1.8]">
                You retain complete autonomy over your cryptographic wallet session. You can disconnect at any point using the Disconnect button in the navigation header or by clearing local browser storage. Disconnecting terminates active Privy sessions immediately.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-[8px] bg-[#141414] border border-[#262626] text-[#5CE1FF] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  06
                </span>
                <h2 className="font-heading text-xl sm:text-2xl text-white uppercase tracking-tight">
                  PROTOCOL EVOLUTION & INQUIRIES
                </h2>
              </div>
              <p className="font-body text-sm sm:text-base text-[#D4D4D4] leading-[1.8] mb-4">
                As decentralized features and smart contracts expand on Robinhood Chain, our privacy disclosures may be refined to reflect upgraded on-chain contracts. Inquiries regarding cryptographic verification or protocol parameters may be directed to our community channels.
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
