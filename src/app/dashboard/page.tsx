'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/useAuth';
import { Gravestone } from '@/components/grave/Gravestone';
import { GraveRecord } from '@/lib/db/schemas';
import {
  Wallet,
  Coins,
  Flame,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Search,
  Sparkles,
} from 'lucide-react';
import { robinhoodExplorerUrl } from '@/lib/chain/config';
import { Button, ButtonLink } from '@/components/ui/Button';
import { ConnectButton } from '@/components/auth/ConnectButton';

export default function DashboardPage() {
  const { authenticated, user, activeWallet, getAccessToken } = useAuth();
  const connectedWallet = (activeWallet || user?.wallet?.address)?.toLowerCase();

  const [devGraves, setDevGraves] = useState<GraveRecord[]>([]);
  const [heldGraves, setHeldGraves] = useState<GraveRecord[]>([]);
  const [claimableBalance, setClaimableBalance] = useState<number>(0);
  const [totalAccrued, setTotalAccrued] = useState<number>(0);
  const [minClaimThreshold, setMinClaimThreshold] = useState<number>(0.0001);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null);
  const [copiedWallet, setCopiedWallet] = useState(false);

  // Filter chips state: 'all' | 'created' | 'holding' | 'highest-earning'
  const [activeTab, setActiveTab] = useState<'all' | 'created' | 'holding' | 'highest-earning'>('all');

  const fetchUserData = useCallback(async () => {
    if (!connectedWallet) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setFetchError(null);

    try {
      let token: string | null = null;
      try {
        token = await getAccessToken();
      } catch {}

      const authHeader = token ? `Bearer ${token}` : `Bearer ${connectedWallet}`;

      const res = await fetch(`/api/claims/request?wallet=${connectedWallet}`, {
        headers: {
          Authorization: authHeader,
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        throw new Error(`Failed to load rewards & memorials (status ${res.status})`);
      }

      const d = await res.json();
      setClaimableBalance(Number(d.claimableBalance || 0));
      setTotalAccrued(Number(d.totalAccrued || 0));
      setMinClaimThreshold(Number(d.minClaimThresholdEth || 0.0001));
      setDevGraves(d.devGraves || []);
      setHeldGraves(d.heldGraves || []);
    } catch (err: any) {
      console.warn('Dashboard fetch error:', err);
      setFetchError(err?.message || 'Network request timed out. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [connectedWallet, getAccessToken]);

  useEffect(() => {
    if (authenticated && connectedWallet) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [authenticated, connectedWallet, fetchUserData]);

  const handleClaim = async () => {
    if (!connectedWallet) return;
    setClaimLoading(true);
    setClaimError(null);
    setClaimSuccess(null);
    setClaimTxHash(null);

    try {
      const token = await getAccessToken();
      const authHeader = token ? `Bearer ${token}` : `Bearer ${connectedWallet}`;

      const res = await fetch('/api/claims/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({ wallet: connectedWallet }),
        signal: AbortSignal.timeout(8000),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Claim payout failed');
      }

      setClaimSuccess(`Successfully sent ${data.amountEth} ETH on Robinhood Chain!`);
      if (data.txHash) {
        setClaimTxHash(data.txHash);
      }
      fetchUserData();
    } catch (err: any) {
      setClaimError(err.message || 'Failed to claim rewards');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleCopyWallet = () => {
    if (connectedWallet) {
      navigator.clipboard.writeText(connectedWallet);
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    }
  };

  // If wallet not connected: show high-contrast connect card
  if (!authenticated || !connectedWallet) {
    return (
      <div className="w-full bg-[#000000] text-white">
        {/* BENTO HEADER ROW */}
        <section className="border-b-[3px] border-[#222222] bg-[#000000]">
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-4 lg:col-span-3 p-6 lg:p-8 border-b-[3px] md:border-b-0 md:border-r-[3px] border-[#222222] bg-[#0A0A0A]">
              <span className="inline-block px-3 py-1 rounded-full bg-[#1237E8] border border-[#222222] text-[11px] font-mono font-bold text-white uppercase mb-3">
                CREATOR & HOLDER HUB
              </span>
              <h1 className="font-heading text-2xl lg:text-3xl text-white uppercase tracking-tight">
                DASHBOARD ↗
              </h1>
            </div>
            <div className="md:col-span-8 lg:col-span-9 p-6 lg:p-8 flex items-center bg-[#000000]">
              <p className="font-body text-sm text-[#A3A3A3] leading-relaxed">
                Connect your creator or holder wallet on Robinhood Chain to review your buried memorials, track qualified views, and claim accumulated ETH rewards.
              </p>
            </div>
          </div>
        </section>

        <section className="min-h-[50vh] flex items-center justify-center p-6 lg:p-12 bg-[#000000]">
          <div className="bento-card p-8 sm:p-12 text-center max-w-md w-full bg-[#0A0A0A] border-[2px] border-[#222222]">
            <div className="w-16 h-16 rounded-full bg-[#121212] border-[2px] border-[#262626] flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0_#000000]">
              <Wallet className="w-8 h-8 text-[#5CE1FF]" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-[#1237E8] border border-[#222222] text-xs font-mono font-bold uppercase mb-2 text-white">
              WALLET REQUIRED
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl text-white uppercase mb-3">
              REWARDS DASHBOARD
            </h2>
            <p className="font-body text-[#A3A3A3] text-sm mb-8 leading-relaxed">
              Connect your wallet to review your buried memorials, track qualified views, and claim accumulated ETH rewards.
            </p>
            <ConnectButton variant="menu-full" />
          </div>
        </section>
      </div>
    );
  }

  // Combined graves with deduplication
  const combinedGravesMap = new Map<string, GraveRecord>();
  devGraves.forEach((g) => combinedGravesMap.set(g.tokenAddress.toLowerCase(), g));
  heldGraves.forEach((g) => {
    if (!combinedGravesMap.has(g.tokenAddress.toLowerCase())) {
      combinedGravesMap.set(g.tokenAddress.toLowerCase(), g);
    }
  });
  const allUserGraves = Array.from(combinedGravesMap.values());

  // Filtered graves based on activeTab
  const filteredGraves = allUserGraves
    .filter((g) => {
      const addr = g.tokenAddress.toLowerCase();
      if (activeTab === 'created') {
        return devGraves.some((dg) => dg.tokenAddress.toLowerCase() === addr);
      }
      if (activeTab === 'holding') {
        return heldGraves.some((hg) => hg.tokenAddress.toLowerCase() === addr);
      }
      return true; // 'all' or 'highest-earning'
    })
    .sort((a, b) => {
      if (activeTab === 'highest-earning') {
        return (b.totalEthEarned || 0) - (a.totalEthEarned || 0);
      }
      return new Date(b.buriedAt).getTime() - new Date(a.buriedAt).getTime();
    });

  const totalQualifiedViews = allUserGraves.reduce((sum, g) => sum + (g.qualifiedViewsCount || 0), 0);

  return (
    <div className="w-full bg-[#000000] text-white">
      {/* BENTO HEADER ROW */}
      <section className="border-b-[3px] border-[#222222] bg-[#000000]">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left label cell */}
          <div className="md:col-span-4 lg:col-span-3 p-6 lg:p-8 border-b-[3px] md:border-b-0 md:border-r-[3px] border-[#222222] bg-[#0A0A0A] flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#1237E8] border border-[#222222] text-[11px] font-mono font-bold text-white uppercase mb-3">
                CREATOR & HOLDER HUB
              </span>
              <h1 className="font-heading text-2xl lg:text-3xl text-white uppercase tracking-tight">
                DASHBOARD ↗
              </h1>
            </div>
            <div className="mt-4 font-mono text-xs font-bold text-[#A3A3A3] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1DB954]" />
              <span className="truncate">WALLET: {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}</span>
            </div>
          </div>

          {/* Right description cell */}
          <div className="md:col-span-8 lg:col-span-9 p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#000000]">
            <div className="max-w-2xl">
              <h2 className="font-heading text-2xl lg:text-3xl text-white uppercase mb-2">
                MY MEMORIALS & REWARDS
              </h2>
              <p className="font-body text-sm text-[#A3A3A3] leading-relaxed">
                Monitor qualified community traffic to your token memorials and claim your accrued creator (60%) and holder (30%) ETH dividends directly on Robinhood Chain.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <ButtonLink
                href="/bury"
                variant="cyan"
                size="md"
                icon={<Flame className="w-3.5 h-3.5 text-[#0A0F2E]" />}
              >
                BURY A TOKEN ↗
              </ButtonLink>
              <Button
                variant="secondary"
                size="md"
                onClick={handleCopyWallet}
                icon={<Copy className="w-3.5 h-3.5 text-[#5CE1FF]" />}
              >
                {copiedWallet ? 'COPIED!' : 'COPY WALLET'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="border-b-[3px] border-[#222222] bg-[#000000]">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Label block */}
          <div className="md:col-span-3 p-6 lg:p-8 border-b-[3px] md:border-b-0 md:border-r-[3px] border-[#222222] bg-[#0A0A0A] flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#5CE1FF] font-bold block mb-1">
                PORTFOLIO
              </span>
              <h2 className="font-heading text-2xl lg:text-3xl text-white uppercase tracking-tight leading-none">
                MY STATS →
              </h2>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[#A3A3A3] mt-4">
              <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
              <span>ROBINHOOD CHAIN</span>
            </div>
          </div>

          {/* 4 Equal Stats Cells */}
          <div className="md:col-span-9 grid grid-cols-2 lg:grid-cols-4 bg-[#000000]">
            <div className="p-6 border-b-[3px] sm:border-b-0 sm:border-r-[3px] border-[#222222] flex flex-col justify-between bg-[#0A0A0A]">
              <span className="font-mono text-xs font-bold uppercase text-[#A3A3A3] mb-2">
                CREATED MEMORIALS
              </span>
              <span className="font-heading text-3xl lg:text-4xl text-white uppercase">
                {devGraves.length}
              </span>
            </div>

            <div className="p-6 border-b-[3px] sm:border-b-0 sm:border-r-[3px] border-[#222222] flex flex-col justify-between bg-[#0A0A0A]">
              <span className="font-mono text-xs font-bold uppercase text-[#A3A3A3] mb-2">
                HOLDING MEMORIALS
              </span>
              <span className="font-heading text-3xl lg:text-4xl text-white uppercase">
                {heldGraves.length}
              </span>
            </div>

            <div className="p-6 border-r-[3px] border-[#222222] flex flex-col justify-between bg-[#0A0A0A]">
              <span className="font-mono text-xs font-bold uppercase text-[#A3A3A3] mb-2">
                QUALIFIED VISITS
              </span>
              <span className="font-heading text-3xl lg:text-4xl text-[#5CE1FF] uppercase">
                {totalQualifiedViews}
              </span>
            </div>

            <div className="p-6 bg-[#121212] flex flex-col justify-between border-t-[3px] sm:border-t-0 border-[#222222]">
              <span className="font-mono text-xs font-bold uppercase text-[#E4FF6B] mb-2">
                TOTAL ETH ACCRUED
              </span>
              <span className="font-heading text-3xl lg:text-4xl text-white uppercase">
                {totalAccrued.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <section className="p-4 sm:p-6 lg:p-10 max-w-[1240px] mx-auto bg-[#000000]">
        {/* REWARD CLAIM CARD */}
        <div className="bento-card p-6 sm:p-8 text-white mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-[#0A0A0A] border-[2px] border-[#222222]">
          <div>
            <span className="px-3 py-1 rounded-full bg-[#E4FF6B] text-[#0A0F2E] text-xs font-mono font-bold uppercase inline-block mb-3 border border-[#0A0F2E]">
              AVAILABLE TREASURY PAYOUT
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl uppercase leading-tight text-white mb-2">
              CLAIM YOUR ACCRUED ETH REWARDS
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#A3A3A3] max-w-xl leading-relaxed">
              Rewards earned from qualified dwell visits are paid directly on Robinhood Chain from the Graven treasury wallet to your connected address.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-3 shrink-0 w-full sm:w-auto">
            <div className="text-left sm:text-right">
              <div className="text-xs font-mono text-[#A3A3A3] uppercase mb-1">AVAILABLE BALANCE:</div>
              <div className="font-heading text-3xl sm:text-4xl text-[#E4FF6B]">
                {claimableBalance.toFixed(4)} ETH
              </div>
            </div>

            <Button
              variant="lime"
              size="lg"
              onClick={handleClaim}
              disabled={claimLoading || claimableBalance <= 0}
              loading={claimLoading}
              icon={<Coins className="w-4 h-4 text-[#0A0F2E]" />}
              className="w-full sm:w-auto"
            >
              {claimableBalance <= 0
                ? 'NO ACCRUED REWARDS'
                : `CLAIM ALL ETH (${claimableBalance.toFixed(4)} ETH) ↗`}
            </Button>
            {claimableBalance > 0 && (
              <span className="text-[11px] font-mono text-[#737373]">
                Minimum claim threshold: {minClaimThreshold} ETH
              </span>
            )}
          </div>
        </div>

        {claimError && (
          <div className="mb-6 p-4 bg-[#FF4D6D]/15 border-[2px] border-[#FF4D6D] rounded-[16px] flex items-center justify-between gap-3 text-xs font-bold text-[#FF4D6D]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{claimError}</span>
            </div>
            <Button variant="danger" size="sm" onClick={handleClaim}>
              RETRY CLAIM
            </Button>
          </div>
        )}

        {claimSuccess && (
          <div className="mb-6 p-4 bg-[#1DB954]/15 border-[2px] border-[#1DB954] rounded-[16px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono font-bold text-white">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#1DB954]" />
              <span>{claimSuccess}</span>
            </div>
            {claimTxHash && (
              <a
                href={`${robinhoodExplorerUrl}/tx/${claimTxHash}`}
                target="_blank"
                rel="noreferrer"
                className="btn-bento bg-[#1A1A1A] text-white border border-[#262626] hover:bg-[#222222] px-3 py-1.5 text-xs flex items-center gap-1.5 text-[#5CE1FF] shrink-0"
              >
                <span>VIEW ON EXPLORER</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {fetchError && (
          <div className="mb-6 p-4 bg-[#FF4D6D]/15 border-[2px] border-[#FF4D6D] rounded-[16px] flex items-center justify-between gap-3 text-xs font-bold text-[#FF4D6D]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fetchError}</span>
            </div>
            <Button variant="danger" size="sm" onClick={fetchUserData}>
              RETRY FETCH
            </Button>
          </div>
        )}

        {/* MEMORIALS SECTION WITH CHIPS/TABS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-2xl sm:text-3xl uppercase tracking-tight text-white">
              MY MEMORIALS ({allUserGraves.length})
            </h2>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-[#5CE1FF]" />}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-full font-ui text-xs font-bold uppercase border shadow-[2px_2px_0_#000000] transition-all cursor-pointer touch-manipulation ${
                activeTab === 'all'
                  ? 'bg-[#1237E8] text-white border-[#222222]'
                  : 'bg-[#121212] text-[#A3A3A3] hover:text-white border-[#262626]'
              }`}
            >
              ALL ({allUserGraves.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('created')}
              className={`px-3 py-1.5 rounded-full font-ui text-xs font-bold uppercase border shadow-[2px_2px_0_#000000] transition-all cursor-pointer touch-manipulation ${
                activeTab === 'created'
                  ? 'bg-[#1237E8] text-white border-[#222222]'
                  : 'bg-[#121212] text-[#A3A3A3] hover:text-white border-[#262626]'
              }`}
            >
              CREATED ({devGraves.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('holding')}
              className={`px-3 py-1.5 rounded-full font-ui text-xs font-bold uppercase border shadow-[2px_2px_0_#000000] transition-all cursor-pointer touch-manipulation ${
                activeTab === 'holding'
                  ? 'bg-[#1237E8] text-white border-[#222222]'
                  : 'bg-[#121212] text-[#A3A3A3] hover:text-white border-[#262626]'
              }`}
            >
              HOLDING ({heldGraves.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('highest-earning')}
              className={`px-3 py-1.5 rounded-full font-ui text-xs font-bold uppercase border shadow-[2px_2px_0_#000000] transition-all cursor-pointer touch-manipulation ${
                activeTab === 'highest-earning'
                  ? 'bg-[#1237E8] text-white border-[#222222]'
                  : 'bg-[#121212] text-[#A3A3A3] hover:text-white border-[#262626]'
              }`}
            >
              TOP EARNING
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bento-card p-6 bg-[#0A0A0A] border-[2px] border-[#222222] animate-pulse min-h-[360px] flex flex-col justify-between"
              >
                <div className="w-40 h-52 bg-[#121212] rounded-[20px] mx-auto border border-[#222222]" />
                <div className="h-20 bg-[#121212] rounded-[16px] border border-[#222222]" />
              </div>
            ))}
          </div>
        ) : filteredGraves.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredGraves.map((grave) => {
              const isDev = devGraves.some(
                (dg) => dg.tokenAddress.toLowerCase() === grave.tokenAddress.toLowerCase()
              );
              return (
                <div
                  key={grave.tokenAddress}
                  className="bento-card p-6 flex flex-col justify-between bg-[#0A0A0A] border-[2px] border-[#222222] hover:-translate-y-1 transition-transform"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {isDev ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E4FF6B] border border-[#0A0F2E] text-[10px] font-mono font-bold text-[#0A0F2E] uppercase">
                        CREATOR (60%)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#1237E8] border border-[#222222] text-[10px] font-mono font-bold text-white uppercase flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-[#5CE1FF]" />
                        ELIGIBLE HOLDER (30%)
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-[#A3A3A3] font-bold">
                      {grave.symbol}
                    </span>
                  </div>

                  <Link
                    href={`/grave/${grave.tokenAddress}`}
                    className="block w-full max-w-[260px] mx-auto mb-5"
                  >
                    <Gravestone data={grave} variant="compact" />
                  </Link>

                  <div className="p-4 bg-[#121212] rounded-[16px] border border-[#262626] text-xs font-mono space-y-2 mb-4">
                    <div className="flex justify-between items-center py-0.5 border-b border-[#222222]">
                      <span className="text-[#A3A3A3] font-bold">TOTAL VIEWS:</span>
                      <span className="font-bold text-white">{grave.viewsCount}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-[#222222]">
                      <span className="text-[#A3A3A3] font-bold">QUALIFIED VISITS:</span>
                      <span className="font-bold text-[#5CE1FF]">{grave.qualifiedViewsCount}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#A3A3A3] font-bold">MEMORIAL ETH:</span>
                      <span className="font-bold text-[#1DB954]">
                        {(grave.totalEthEarned || 0).toFixed(4)} ETH
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <ButtonLink
                      href={`/grave/${grave.tokenAddress}`}
                      variant="cyan"
                      size="sm"
                      fullWidth
                    >
                      VIEW GRAVE →
                    </ButtonLink>
                    <a
                      href={`${robinhoodExplorerUrl}/address/${grave.tokenAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-bento bg-[#1A1A1A] text-white border border-[#262626] hover:bg-[#222222] px-3 py-1.5 text-xs"
                      title="View on Robinhood Explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-white" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bento-card p-12 text-center max-w-md mx-auto bg-[#0A0A0A] border-[2px] border-[#222222]">
            <div className="w-20 h-20 relative mx-auto mb-4">
              <Image
                src="/assets/logo.png"
                alt="No graves mascot"
                fill
                sizes="80px"
                className="object-contain"
              />
            </div>
            <h3 className="font-heading text-2xl uppercase mb-2 text-white">
              NO MEMORIALS FOUND
            </h3>
            <p className="font-body text-xs sm:text-sm text-[#A3A3A3] max-w-sm mx-auto mb-6 leading-relaxed">
              You haven&apos;t buried any tokens or held buried tokens yet. Burying dead tokens unlocks creator and holder view rewards.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <ButtonLink
                href="/bury"
                variant="cyan"
                size="md"
                icon={<Flame className="w-4 h-4 text-[#0A0F2E]" />}
              >
                BURY A TOKEN ↗
              </ButtonLink>
              <ButtonLink
                href="/graves"
                variant="secondary"
                size="md"
                icon={<Search className="w-4 h-4 text-[#5CE1FF]" />}
              >
                EXPLORE CEMETERY ↗
              </ButtonLink>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
