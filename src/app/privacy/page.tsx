import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="w-full bg-[#F6F4FF]">
      {/* BENTO HEADER ROW */}
      <section className="border-b-[3px] border-[#0A0F2E] bg-white">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left label cell */}
          <div className="md:col-span-4 lg:col-span-3 bg-[#BFD8FF] p-6 lg:p-8 border-b-[3px] md:border-b-0 md:border-r-[3px] border-[#0A0F2E] flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-white border-2 border-[#0A0F2E] text-[11px] font-mono font-bold text-[#0A0F2E] uppercase mb-3">
                DATA SPEC
              </span>
              <h1 className="font-heading text-2xl lg:text-3xl text-[#0A0F2E] uppercase tracking-tight">
                PRIVACY ↗
              </h1>
            </div>
            <div className="mt-4 font-mono text-xs font-bold text-[#0A0F2E]/70 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#1237E8]" />
              <span>ON-CHAIN GOVERNANCE</span>
            </div>
          </div>

          {/* Right description cell */}
          <div className="md:col-span-8 lg:col-span-9 p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
            <div className="max-w-2xl">
              <h2 className="font-heading text-2xl lg:text-3xl text-[#0A0F2E] uppercase mb-2">
                PRIVACY POLICY
              </h2>
              <p className="font-body text-sm text-[#0A0F2E]/75 leading-relaxed">
                Principles of minimal data retention, public on-chain transparency, and secure cryptographic wallet authentication for Graven.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/graves"
                className="btn-bento bg-white text-[#0A0F2E] text-xs py-3 px-4"
              >
                ← ALL GRAVES
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <section className="p-6 lg:p-12 max-w-[960px] mx-auto">
        <div className="bento-card p-6 sm:p-10 bg-white">
          <div className="space-y-8 font-body text-base text-[#0A0F2E]/80 leading-[1.65]">
            <section>
              <h2 className="font-heading text-xl text-[#0A0F2E] uppercase mb-3">
                1. MINIMAL DATA COLLECTION
              </h2>
              <p>
                Graven respects Web3 privacy principles. We do not maintain user email databases, collect real-world personal identifying information, or deploy invasive tracking trackers. Interactions are anchored to public wallet addresses and on-chain smart contract transactions.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl text-[#0A0F2E] uppercase mb-3">
                2. ON-CHAIN TRANSPARENCY
              </h2>
              <p>
                All contract addresses, creator signatures, burial timestamps, and payout transactions are recorded publicly on Robinhood Chain and indexed via decentralized block explorers. Public blockchain data cannot be erased, edited, or suppressed.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl text-[#0A0F2E] uppercase mb-3">
                3. LOCAL STORAGE & AUTHENTICATION
              </h2>
              <p>
                Wallet connection sessions are managed securely through Privy cryptographic tokens stored in local client sessions. In-memory rate limiting and timing tokens are used strictly to safeguard against automated sybil attacks and protect reward liquidity.
              </p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t-2 border-[#0A0F2E]/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href="/" className="btn-bento bg-white text-[#0A0F2E] text-xs py-3 px-5">
              <ArrowLeft className="w-3.5 h-3.5 mr-1 inline" />
              <span>BACK TO HOME</span>
            </Link>
            <span className="font-mono text-xs text-[#0A0F2E]/50">LAST PROTOCOL UPDATE: 2026</span>
          </div>
        </div>
      </section>
    </div>
  );
}
