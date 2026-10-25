'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePrivy } from '@/lib/auth/useAuth';
import { Gravestone } from '@/components/grave/Gravestone';
import { GraveRecord, TokenRecord, HolderSnapshot } from '@/lib/db/schemas';
import {
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Eye,
  Share2,
  Sparkles,
  Award,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import { robinhoodExplorerUrl } from '@/lib/chain/config';
import { ButtonLink } from '@/components/ui/Button';

export default function GraveDetailPage() {
  const params = useParams();
  const address = (params?.address as string)?.toLowerCase();
  const { authenticated, user, getAccessToken } = usePrivy();

  const [grave, setGrave] = useState<GraveRecord | null>(null);
  const [token, setToken] = useState<TokenRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedDev, setCopiedDev] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [storyOpen, setStoryOpen] = useState(true);
  const [viewRewardState, setViewRewardState] = useState<string | null>(null);

  const connectedWallet = user?.wallet?.address?.toLowerCase();
  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTrackedRef = useRef(false);

  // Fetch Grave Details
  useEffect(() => {
    if (!address) return;

    const fetchGrave = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/graves/${address}`, {
          signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) {
          if (res.status === 404) {
            setError('Grave not found in the cemetery.');
          } else {
            setError('Unable to load grave memorial.');
          }
          return;
        }

        const data = await res.json();
        setGrave(data.grave);
        setToken(data.token);
      } catch (err: any) {
        setError(err.name === 'TimeoutError' ? 'Memorial request timed out after 8s.' : 'Unable to connect to cemetery server.');
      } finally {
        setLoading(false);
      }
    };

    fetchGrave();
  }, [address]);

  // 5-Second Dwell Timer for Qualified View Tracking
  useEffect(() => {
    if (!address || hasTrackedRef.current) return;

    dwellTimerRef.current = setTimeout(async () => {
      hasTrackedRef.current = true;
      try {
        let authHeader = '';
        if (authenticated) {
          try {
            const token = await getAccessToken();
            if (token) authHeader = `Bearer ${token}`;
          } catch {}
        }

        const res = await fetch('/api/views/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
          body: JSON.stringify({ tokenAddress: address }),
          signal: AbortSignal.timeout(8000),
        });

        if (res.ok) {
          const trackData = await res.json();
          if (trackData.qualified) {
            setViewRewardState('QUALIFIED_EARNED');
            setGrave((prev) =>
              prev
                ? {
                    ...prev,
                    viewsCount: prev.viewsCount + 1,
                    qualifiedViewsCount: prev.qualifiedViewsCount + 1,
                  }
                : null
            );
          } else {
            setViewRewardState('VISIT_LOGGED');
            setGrave((prev) =>
              prev ? { ...prev, viewsCount: prev.viewsCount + 1 } : null
            );
          }
        }
      } catch (err) {
        console.warn('View tracking error:', err);
      }
    }, 5500);

    return () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    };
  }, [address, authenticated, getAccessToken]);

  const copyToClipboard = (text: string, type: 'contract' | 'dev' | 'share') => {
    navigator.clipboard.writeText(text);
    if (type === 'contract') {
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2000);
    } else if (type === 'dev') {
      setCopiedDev(true);
      setTimeout(() => setCopiedDev(false), 2000);
    } else {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  if (loading) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#000000] text-white">
        <Loader2 className="w-12 h-12 animate-spin text-[#5CE1FF] mb-4" />
        <p className="font-mono text-sm font-bold uppercase tracking-wider text-[#A3A3A3]">
          Uncovering Memorial...
        </p>
      </main>
    );
  }

  if (error || !grave) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#000000] text-white">
        <div className="bento-card p-8 text-center max-w-md w-full bg-[#0A0A0A] border-[2px] border-[#222222]">
          <AlertCircle className="w-12 h-12 text-[#FF4D6D] mx-auto mb-4" />
          <h2 className="font-heading text-2xl uppercase mb-2 text-white">TOMB NOT RECORDED</h2>
          <p className="font-body text-sm text-[#A3A3A3] mb-6">{error || 'Unknown error'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <ButtonLink href="/graves" variant="secondary" size="sm">
              BROWSE CEMETERY
            </ButtonLink>
            <ButtonLink href={`/bury?token=${address}`} variant="cyan" size="sm">
              BURY THIS COIN ↗
            </ButtonLink>
          </div>
        </div>
      </main>
    );
  }

  const isCreator = connectedWallet && grave.devWallet.toLowerCase() === connectedWallet;

  return (
    <div className="w-full bg-[#000000] text-white">
      {/* BENTO HEADER ROW */}
      <section className="border-b-[3px] border-[#222222] bg-[#000000]">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left label cell */}
          <div className="md:col-span-4 lg:col-span-3 bg-[#0A0A0A] p-6 lg:p-8 border-b-[3px] md:border-b-0 md:border-r-[3px] border-[#222222] flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#1237E8] border border-[#222222] text-[11px] font-mono font-bold text-white uppercase mb-3">
                MEMORIAL ARCHIVE
              </span>
              <h1 className="font-heading text-2xl lg:text-3xl text-white uppercase tracking-tight">
                GRAVE SHRINE ↗
              </h1>
            </div>
            <div className="mt-4 font-mono text-xs font-bold text-[#A3A3A3] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1DB954] animate-pulse" />
              <span>CHAIN MEMORIAL #{(grave.tokenAddress || '').slice(2, 8).toUpperCase()}</span>
            </div>
          </div>

          {/* Right description cell */}
          <div className="md:col-span-8 lg:col-span-9 p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#000000]">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-heading text-2xl lg:text-3xl text-white uppercase">
                  {grave.name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#1237E8] border border-[#222222] text-xs font-mono font-bold text-white">
                  ${grave.symbol}
                </span>
              </div>
              <p className="font-body text-sm text-[#A3A3A3] leading-relaxed">
                Cryptographically engraved monument on Robinhood Chain. Visit duration rewards original token holders with accrued ETH.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <ButtonLink
                href="/graves"
                variant="secondary"
                size="sm"
              >
                ← ALL GRAVES
              </ButtonLink>
              <ButtonLink
                href={`/bury?token=${address}`}
                variant="cyan"
                size="sm"
              >
                BURY ANOTHER ↗
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* TOP NOTIFICATION BAR (Qualified visit state) */}
      {viewRewardState === 'QUALIFIED_EARNED' && (
        <div className="border-b-[3px] border-[#222222] p-4 bg-[#121212] flex flex-wrap items-center justify-between gap-3 px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1DB954]">
            <Sparkles className="w-4 h-4 text-[#5CE1FF]" />
            <span>QUALIFIED VISIT VERIFIED: Accrued ETH reward to original holders & creator!</span>
          </div>
          <Link href="/dashboard" className="text-xs font-bold font-mono underline text-[#5CE1FF] hover:text-white">
            VIEW REWARDS DASHBOARD →
          </Link>
        </div>
      )}

      {/* MAIN CONTENT BENTO GRID */}
      <section className="p-6 lg:p-10 max-w-[1240px] mx-auto bg-[#000000]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Large Full Gravestone (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full bento-card p-6 sm:p-8 bg-[#0A0A0A] border-[2px] border-[#222222] flex flex-col items-center">
              <div className="w-full max-w-[380px] mb-6">
                <Gravestone data={grave} variant="full" animateRising={false} />
              </div>

              {/* Actions under Gravestone */}
              <div className="w-full flex items-center justify-between gap-3 pt-6 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => copyToClipboard(window.location.href, 'share')}
                  className="flex-1 btn-bento bg-[#121212] text-white border border-[#262626] hover:bg-[#1A1A1A] text-xs py-3"
                >
                  {copiedShare ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#1DB954] mr-1 inline" />
                      <span>LINK COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 mr-1 inline text-[#5CE1FF]" />
                      <span>SHARE MEMORIAL</span>
                    </>
                  )}
                </button>

                <a
                  href={`${robinhoodExplorerUrl}/token/${grave.tokenAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-bento bg-[#1237E8] text-white border border-[#222222] text-xs py-3 px-5 hover:bg-[#0A1FC4]"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1 inline" />
                  <span>EXPLORER ↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Bento Info Cells (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Cell 1: Overview & Cryptographic Verification */}
            <div className="bento-card p-6 sm:p-8 bg-[#0A0A0A] border-[2px] border-[#222222]">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#121212] border border-[#262626] text-xs font-mono font-bold uppercase text-[#5CE1FF]">
                    {grave.launchpad.toUpperCase()} LAUNCHPAD
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/40 text-xs font-mono font-bold uppercase flex items-center gap-1 text-[#1DB954]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1DB954]" />
                    <span>SIGNATURE VERIFIED</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#5CE1FF] bg-[#121212] px-3.5 py-1.5 rounded-full border border-[#262626]">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{grave.viewsCount} VISITS ({grave.qualifiedViewsCount} QUALIFIED)</span>
                </div>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl text-white uppercase mb-4 leading-tight">
                {grave.name} (${grave.symbol})
              </h2>

              <div className="p-4 bg-[#121212] rounded-[16px] border border-[#262626] mb-6">
                <div className="text-[10px] font-mono font-bold text-[#A3A3A3] uppercase mb-1">
                  OFFICIAL EPITAPH
                </div>
                <p className="font-serif italic text-white text-lg sm:text-xl">
                  &ldquo;{grave.epitaph}&rdquo;
                </p>
              </div>

              {/* Token & Dev Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-4 border-t border-[#222222]">
                <div className="p-4 bg-[#121212] rounded-[16px] border border-[#262626]">
                  <div className="text-[10px] text-[#A3A3A3] uppercase font-bold mb-1.5">
                    TOKEN CONTRACT
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      {grave.tokenAddress.slice(0, 8)}...{grave.tokenAddress.slice(-6)}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(grave.tokenAddress, 'contract')}
                      className="p-1.5 rounded-[8px] bg-[#1A1A1A] border border-[#262626] text-white hover:bg-[#222222]"
                      title="Copy contract"
                    >
                      {copiedContract ? <Check className="w-3.5 h-3.5 text-[#1DB954]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[#121212] rounded-[16px] border border-[#262626]">
                  <div className="text-[10px] text-[#A3A3A3] uppercase font-bold mb-1.5">
                    CREATOR WALLET
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      {grave.devWallet.slice(0, 8)}...{grave.devWallet.slice(-6)}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(grave.devWallet, 'dev')}
                      className="p-1.5 rounded-[8px] bg-[#1A1A1A] border border-[#262626] text-white hover:bg-[#222222]"
                      title="Copy creator address"
                    >
                      {copiedDev ? <Check className="w-3.5 h-3.5 text-[#1DB954]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cell 2: Story Scroll (Unrolls, Neutral description) */}
            <div className="bento-card p-6 sm:p-8 bg-[#0A0A0A] border-[2px] border-[#222222]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#5CE1FF]" />
                  <h3 className="font-heading text-xl uppercase tracking-tight text-white">
                    TOKEN LIFECYCLE STORY SCROLL
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStoryOpen(!storyOpen)}
                  className="text-xs font-mono font-bold uppercase underline text-[#5CE1FF]"
                >
                  {storyOpen ? 'COLLAPSE' : 'EXPAND'}
                </button>
              </div>

              {storyOpen && (
                <div className="space-y-4 text-xs font-mono text-[#D4D4D4] pt-2 animate-in fade-in duration-200">
                  <div className="p-4 bg-[#121212] rounded-[16px] border border-[#262626] space-y-3">
                    <div className="flex justify-between items-center py-1 border-b border-[#222222]">
                      <span className="text-[#A3A3A3]">LAUNCH DATE:</span>
                      <span className="font-bold text-white">{grave.birthDate.slice(0, 10)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[#222222]">
                      <span className="text-[#A3A3A3]">DEATH ATTESTATION:</span>
                      <span className="font-bold text-white">{grave.deathDate.slice(0, 10)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[#222222]">
                      <span className="text-[#A3A3A3]">LIFESPAN:</span>
                      <span className="font-bold text-[#5CE1FF]">{grave.daysLived} DAYS</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[#222222]">
                      <span className="text-[#A3A3A3]">RECORDED PEAK MCAP:</span>
                      <span className="font-bold text-white">{grave.peakMcapEth.toFixed(3)} ETH</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[#A3A3A3]">CREATOR STATUS:</span>
                      <span className="font-bold text-[#1DB954]">
                        Signed permanent memorial attestation
                      </span>
                    </div>
                  </div>

                  {/* Original Holder Badge if user was creator */}
                  {isCreator && (
                    <div className="p-3 bg-[#E4FF6B]/10 rounded-[16px] border border-[#E4FF6B]/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#E4FF6B]" />
                        <span className="font-bold text-[#E4FF6B]">YOU ARE THE VERIFIED CREATOR</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-[#E4FF6B]">60% ACCRUAL ACTIVE</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cell 3: Second Life (Bonding Curve / Graduation Meter) */}
            <div className="bento-card p-6 sm:p-8 bg-[#0A0A0A] border-[2px] border-[#222222]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#5CE1FF]" />
                  <h3 className="font-heading text-xl uppercase tracking-tight text-white">
                    SECOND LIFE PATHWAY
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#121212] border border-[#262626] text-[#5CE1FF]">
                  {grave.launchpad === 'pons' ? 'BONDING CURVE' : 'GENERIC ERC-20'}
                </span>
              </div>

              {grave.launchpad === 'pons' ? (
                <div>
                  <p className="font-body text-xs text-[#A3A3A3] mb-3 leading-relaxed">
                    Pons tokens possess an on-chain rebirth trigger if the bonding curve graduates to decentralized AMM pools.
                  </p>
                  <div className="w-full h-5 rounded-full bg-[#121212] border border-[#262626] p-0.5 mb-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#5CE1FF] transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, token?.bondingCurveProgress || 10))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono font-bold text-[#A3A3A3]">
                    <span>PROGRESS: {token?.bondingCurveProgress || 10}%</span>
                    <span>{grave.isRisen ? 'STATUS: RISEN' : 'THRESHOLD: 100%'}</span>
                  </div>
                </div>
              ) : (
                <p className="font-body text-xs text-[#A3A3A3] leading-relaxed">
                  This token was buried via the generic Robinhood Chain adapter. It does not have an automated bonding curve second-life path.
                </p>
              )}
            </div>

            {/* Cell 4: Holder Rewards Panel */}
            <div className="bento-card p-6 sm:p-8 bg-gradient-to-br from-[#1237E8] to-[#0A1FC4] text-white border-[2px] border-[#222222]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-xl uppercase tracking-tight text-white">
                  COMMUNITY REWARDS ACCRUED
                </h3>
                <span className="font-heading text-2xl text-[#E4FF6B]">
                  {grave.totalEthEarned.toFixed(4)} ETH
                </span>
              </div>
              <p className="font-body text-xs text-white/80 leading-relaxed mb-6">
                Every qualified visit generates ETH split between the creator wallet and original holders recorded in the snapshot.
              </p>
              <div className="flex justify-end">
                <ButtonLink href="/dashboard" variant="lime" size="md">
                  CHECK MY CLAIMABLE REWARDS ↗
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
