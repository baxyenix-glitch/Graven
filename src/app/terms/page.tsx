import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="w-full bg-[#F6F4FF]">
      {/* BENTO HEADER ROW */}
      <section className="border-b-[3px] border-[#0A0F2E] bg-white">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left label cell */}
          <div className="md:col-span-4 lg:col-span-3 bg-[#BFD8FF] p-6 lg:p-8 border-b-[3px] md:border-b-0 md:border-r-[3px] border-[#0A0F2E] flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-white border-2 border-[#0A0F2E] text-[11px] font-mono font-bold text-[#0A0F2E] uppercase mb-3">
                LEGAL SPEC
              </span>
              <h1 className="font-heading text-2xl lg:text-3xl text-[#0A0F2E] uppercase tracking-tight">
                TERMS ↗
              </h1>
            </div>
            <div className="mt-4 font-mono text-xs font-bold text-[#0A0F2E]/70 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1237E8]" />
              <span>ROBINHOOD CHAIN PROTOCOL</span>
            </div>
          </div>

          {/* Right description cell */}
          <div className="md:col-span-8 lg:col-span-9 p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
            <div className="max-w-2xl">
              <h2 className="font-heading text-2xl lg:text-3xl text-[#0A0F2E] uppercase mb-2">
                TERMS OF SERVICE
              </h2>
              <p className="font-body text-sm text-[#0A0F2E]/75 leading-relaxed">
                Rules, token creator requirements, cryptographic attestation terms, and automated treasury reward policies governing the Graven cemetery.
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
                1. PROTOCOL PURPOSE
              </h2>
              <p>
                Graven (&ldquo;the Protocol&rdquo;) operates as a decentralized digital memorial archive on Robinhood Chain. Graven enables token creators to immortalize terminated or expired ERC-20 smart contracts under cryptographic signatures, while distributing community visit rewards to verifiable original holders.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl text-[#0A0F2E] uppercase mb-3">
                2. ELIGIBILITY & BURIAL RULES
              </h2>
              <p>
                Only the verified on-chain creator of a contract on Robinhood Chain is eligible to execute official burials. Token creators must hold the requisite quantity of $GRAVEN tokens. Epitaphs containing malicious hyperlinks, harassment, or defamatory speech are strictly prohibited and subject to protocol blacklisting.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl text-[#0A0F2E] uppercase mb-3">
                3. REWARDS & TREASURY DISTRIBUTIONS
              </h2>
              <p>
                Rewards are distributed in Robinhood Chain ETH based on verified qualified visits. Qualified visits require active page visibility and are capped per 24-hour epoch. Graven does not guarantee financial returns or investment outcomes. All blockchain operations are final and subject to underlying network gas fees and block confirmations.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl text-[#0A0F2E] uppercase mb-3">
                4. DISCLAIMER OF WARRANTIES
              </h2>
              <p>
                Graven is provided &ldquo;as is&rdquo; without warranties of any kind. Users interact with smart contracts, decentralized wallets, and third-party RPC infrastructure entirely at their own risk.
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
