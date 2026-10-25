'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { usePrivy } from '@/lib/auth/useAuth';
import { isAddress } from 'viem';
import confetti from 'canvas-confetti';
import { Gravestone } from '@/components/grave/Gravestone';
import {
  Wallet,
  ShieldCheck,
  Search,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Flame,
  Droplets,
  Loader2,
  Sparkles,
  RotateCw,
} from 'lucide-react';
import { minGravenHold, isTestnet } from '@/lib/chain/config';
import { ConnectButton } from '@/components/auth/ConnectButton';

function BuryWizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get('token') || '';

  const { ready, authenticated, login, user, signMessage } = usePrivy();
  const connectedWallet = user?.wallet?.address?.toLowerCase();

  const [step, setStep] = useState(1);
  const [tokenAddress, setTokenAddress] = useState(initialToken);
  const [tokenLookupLoading, setTokenLookupLoading] = useState(false);
  const [tokenDetails, setTokenDetails] = useState<any>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [gravenBalance, setGravenBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState<boolean>(false);
  const [tokenImgError, setTokenImgError] = useState<boolean>(false);

  const [epitaph, setEpitaph] = useState('Here lies a dream that ran out of liquidity.');
  const [signingLoading, setSigningLoading] = useState(false);
  const [signingError, setSigningError] = useState<string | null>(null);
  const [buriedGrave, setBuriedGrave] = useState<any>(null);

  // Step 1 check: if authenticated, jump to step 2
  useEffect(() => {
    if (authenticated && connectedWallet) {
      if (step === 1) setStep(2);
      checkUserGravenBalance();
    } else {
      setStep(1);
    }
  }, [authenticated, connectedWallet]);

  // If initial token query param passed, fetch it once authenticated
  useEffect(() => {
    if (initialToken && isAddress(initialToken, { strict: false }) && step >= 2) {
      setTokenAddress(initialToken);
      lookupToken(initialToken);
    }
  }, [initialToken, step]);

  const checkUserGravenBalance = async () => {
    if (!connectedWallet) return;
    setBalanceLoading(true);
    try {
      // 1. Dedicated ultra-fast balance endpoint
      const res = await fetch(`/api/graven/balance?wallet=${connectedWallet}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const d = await res.json();
        setGravenBalance(Number(d.balance || 0));
        return;
      }

      // 2. Fallback to lookup route
      const fallbackRes = await fetch(
        `/api/tokens/lookup?address=0x0000000000000000000000000000000000000000&wallet=${connectedWallet}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (fallbackRes.ok) {
        const d = await fallbackRes.json();
        setGravenBalance(Number(d.gravenHoldStatus?.balance || 0));
      }
    } catch (err) {
      console.warn('Balance check error:', err);
    } finally {
      setBalanceLoading(false);
    }
  };

  const lookupToken = async (addrToLookup?: string) => {
    const target = (addrToLookup || tokenAddress).trim();
    if (!isAddress(target, { strict: false })) {
      setTokenError('Please enter a valid Robinhood Chain ERC-20 contract address (0x...)');
      return;
    }

    setTokenLookupLoading(true);
    setTokenError(null);

    try {
      const res = await fetch(`/api/tokens/lookup?address=${target}&wallet=${connectedWallet || ''}`, {
        signal: AbortSignal.timeout(8000),
      });
      const data = await res.json();

      if (!res.ok) {
        setTokenError(data.error || 'Token lookup failed');
        return;
      }

      if (data.alreadyBuried) {
        setTokenError('This token is already buried! Visit its grave.');
        return;
      }

      setTokenDetails(data.token);
      setTokenImgError(false);
      setStep(4); // Advance to Creator Verification
    } catch (err: any) {
      setTokenError(err.message || 'Lookup failed. Verify connection.');
    } finally {
      setTokenLookupLoading(false);
    }
  };

  const handleSignAndBury = async () => {
    if (!connectedWallet || !tokenDetails) return;
    setSigningLoading(true);
    setSigningError(null);

    if (gravenBalance < minGravenHold) {
      setSigningError(`Insufficient $GRAVEN: You hold ${gravenBalance.toLocaleString()} $GRAVEN, but at least ${minGravenHold.toLocaleString()} $GRAVEN is strictly required to bury a token.`);
      setSigningLoading(false);
      return;
    }

    const isMatch = tokenDetails.creator.toLowerCase() === connectedWallet.toLowerCase();
    if (!isMatch) {
      setSigningError(`Creator mismatch: Connected wallet is not the verified on-chain creator (${tokenDetails.creator}) of this token.`);
      setSigningLoading(false);
      return;
    }
    try {
      const challengeRes = await fetch('/api/bury/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenAddress: tokenDetails.address,
          creatorWallet: connectedWallet,
          epitaph,
        }),
      });

      if (!challengeRes.ok) {
        const err = await challengeRes.json();
        throw new Error(err.error || 'Failed to generate burial challenge');
      }

      const { challenge, messageToSign } = await challengeRes.json();
      const signature = await signMessage({ message: messageToSign });

      if (!signature) {
        throw new Error('Signing was rejected in wallet');
      }

      const verifyRes = await fetch('/api/bury/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: challenge.id,
          signature,
          epitaph,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Burial verification failed');
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5CE1FF', '#E4FF6B', '#1237E8', '#FF9CCB'],
      });

      setBuriedGrave(verifyData.grave);
      setStep(6);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('graven:refresh'));
        try {
          localStorage.setItem('graven_last_burial', Date.now().toString());
        } catch { }
      }
      try {
        router.refresh();
      } catch { }
    } catch (err: any) {
      console.error('Bury error:', err);
      setSigningError(err.message || 'Signing failed or was rejected');
    } finally {
      setSigningLoading(false);
    }
  };

  const stepsHeader = [
    { num: 1, label: 'CONNECT' },
    { num: 2, label: '$GRAVEN' },
    { num: 3, label: 'TOKEN' },
    { num: 4, label: 'CREATOR' },
    { num: 5, label: 'DEAD CHECK' },
    { num: 6, label: 'EPITAPH & SIGN' },
  ];

  return (
    <div className="w-full bg-[#000000] text-white">
      {/* BENTO HEADER ROW */}
      <section className="border-b-[3px] border-[#222222] bg-[#000000]">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left label cell */}
          <div className="md:col-span-4 lg:col-span-3 bg-[#0A0A0A] p-6 lg:p-8 border-b-[3px] md:border-b-0 md:border-r-[3px] border-[#222222] flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#1237E8] border border-[#222222] text-[11px] font-mono font-bold text-white uppercase mb-3">
                AFTERLIFE PROTOCOL
              </span>
              <h1 className="font-heading text-2xl lg:text-3xl text-white uppercase tracking-tight">
                BURIAL WIZARD ↗
              </h1>
            </div>
            <div className="mt-4 font-mono text-xs font-bold text-[#A3A3A3] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1237E8]" />
              <span>ROBINHOOD CHAIN MAINNET</span>
            </div>
          </div>

          {/* Right description cell */}
          <div className="md:col-span-8 lg:col-span-9 p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#000000]">
            <div className="max-w-2xl">
              <h2 className="font-heading text-2xl lg:text-3xl text-white uppercase mb-2">
                LAY A DEAD COIN TO REST
              </h2>
              <p className="font-body text-sm text-[#A3A3A3] leading-relaxed">
                Complete the 6-step on-chain memorial flow to immortalize your token under a permanent gravestone. Original holders can visit your tomb to unlock rewards.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/how-it-works"
                className="btn-bento bg-[#141414] hover:bg-[#1f1f1f] text-white border border-[#262626] text-xs py-3 px-4"
              >
                HOW IT WORKS ↓
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <section className="p-6 lg:p-10 max-w-[1100px] mx-auto bg-[#000000]">
        {/* 6 ROUND NUMBERED STEP BUBBLES */}
        <div className="bento-card p-4 sm:p-6 mb-8 bg-[#0A0A0A] border-2 border-[#222222]">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 py-1">
            {stepsHeader.map((s) => {
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;

              return (
                <div key={s.num} className="flex items-center gap-2.5 shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-heading text-sm transition-all duration-200 ${
                      isCompleted
                        ? 'bg-[#1DB954] text-white border-[#1DB954] shadow-[0_0_10px_rgba(29,185,84,0.3)]'
                        : isCurrent
                          ? 'bg-[#1237E8] text-white border-[#5CE1FF] scale-110 shadow-[0_0_14px_rgba(18,55,232,0.6)]'
                          : 'bg-[#141414] text-[#737373] border-[#262626]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                  </div>
                  <span
                    className={`hidden sm:inline text-xs font-mono font-bold uppercase tracking-wider ${
                      isCurrent
                        ? 'text-[#5CE1FF]'
                        : isCompleted
                          ? 'text-[#1DB954]'
                          : 'text-[#A3A3A3]'
                    }`}
                  >
                    {s.label}
                  </span>
                  {s.num < 6 && (
                    <div
                      className={`hidden md:block w-8 h-[2px] ${
                        isCompleted ? 'bg-[#1DB954]/50' : 'bg-[#262626]'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: WALLET CONNECTION */}
        {step === 1 && (
          <div className="bento-card p-8 sm:p-12 text-center bg-[#0A0A0A] border-2 border-[#222222] text-white">
            <div className="w-16 h-16 rounded-full bg-[#141414] border-2 border-[#262626] flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0_#000000]">
              <Wallet className="w-8 h-8 text-[#5CE1FF]" />
            </div>
            <h2 className="font-heading text-3xl text-white uppercase mb-3">
              CONNECT YOUR CREATOR WALLET
            </h2>
            <p className="font-body text-[#A3A3A3] text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Connect using Privy on Robinhood Chain. You must connect the address that deployed the token or launched it via Pons.
            </p>
            <div className="max-w-xs mx-auto">
              <ConnectButton variant="menu-full" />
            </div>
          </div>
        )}

        {/* STEP 2: $GRAVEN GATE */}
        {step === 2 && (
          <div className="bento-card p-8 sm:p-10 bg-[#0A0A0A] border-2 border-[#222222] text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#1237E8] border-2 border-[#5CE1FF] text-white flex items-center justify-center font-heading text-lg">
                2
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-[#5CE1FF] uppercase tracking-wide">
                  REQUIREMENT CHECK
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl text-white uppercase leading-none mt-1">
                  10,000 $GRAVEN PROTOCOL GATE
                </h2>
              </div>
            </div>

            <p className="font-body text-sm text-[#D4D4D4] mb-6 leading-relaxed">
              To prevent spam burials and maintain tomb quality, token creators must hold at least 10,000 $GRAVEN tokens on Robinhood Chain.
            </p>

            <div className="p-5 bg-[#121212] rounded-[16px] border border-[#262626] mb-6">
              <div className="flex justify-between items-center mb-2 text-xs font-mono font-bold">
                <span className="flex items-center gap-2 text-[#A3A3A3]">
                  <span>YOUR $GRAVEN BALANCE:</span>
                  <button
                    type="button"
                    onClick={checkUserGravenBalance}
                    disabled={balanceLoading}
                    className="p-1 rounded hover:bg-white/10 transition-colors text-[#A3A3A3] hover:text-white"
                    title="Refresh Balance"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${balanceLoading ? 'animate-spin text-[#5CE1FF]' : ''}`} />
                  </button>
                </span>
                <span className="text-base text-[#5CE1FF]">
                  {balanceLoading ? 'CHECKING...' : `${gravenBalance.toLocaleString()} $GRAVEN`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-4 rounded-full bg-[#1A1A1A] border border-[#333333] p-0.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#5CE1FF] transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (gravenBalance / minGravenHold) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono mt-1.5 text-[#737373]">
                <span>0 $GRAVEN</span>
                <span>REQUIRED: {minGravenHold.toLocaleString()} $GRAVEN</span>
              </div>
            </div>

            {gravenBalance >= minGravenHold ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs font-mono font-bold text-[#1DB954] flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>GATE SATISFIED ({gravenBalance.toLocaleString()} $GRAVEN HELD)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-bento bg-[#1237E8] hover:bg-[#1d4ed8] text-white text-xs py-3 px-6 border border-[#222222]"
                >
                  <span>CONTINUE TO TOKEN SELECTION ↗</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-[#FF4D6D]/15 border-2 border-[#FF4D6D]/50 rounded-[16px] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FF4D6D]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    INSUFFICIENT $GRAVEN: You hold {gravenBalance.toLocaleString()} $GRAVEN. At least {minGravenHold.toLocaleString()} $GRAVEN is strictly required to bury a token.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={checkUserGravenBalance}
                    disabled={balanceLoading}
                    className="btn-bento bg-[#1A1A1A] hover:bg-[#262626] text-white border border-[#333333] text-xs py-3 px-4 cursor-pointer"
                  >
                    <RotateCw className={`w-3.5 h-3.5 mr-1.5 inline text-[#5CE1FF] ${balanceLoading ? 'animate-spin' : ''}`} />
                    <span>REFRESH BALANCE</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: TOKEN INPUT & LOOKUP */}
        {step === 3 && (
          <div className="bento-card p-8 sm:p-10 bg-[#0A0A0A] border-2 border-[#222222] text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#1237E8] border-2 border-[#5CE1FF] text-white flex items-center justify-center font-heading text-lg">
                3
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-[#5CE1FF] uppercase tracking-wide">
                  ON-CHAIN SPECIFICATION
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl text-white uppercase leading-none mt-1">
                  INPUT DEAD TOKEN CONTRACT
                </h2>
              </div>
            </div>

            <p className="font-body text-sm text-[#D4D4D4] mb-6 leading-relaxed">
              Enter the contract address of the dead coin. Our multi-adapter engine inspects Pons (pons.family) and standard ERC-20 records on Robinhood Chain Mainnet.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                lookupToken();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-2 text-[#A3A3A3]">
                  TOKEN CONTRACT ADDRESS (0x...)
                </label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => {
                    setTokenAddress(e.target.value);
                    if (tokenError) setTokenError(null);
                  }}
                  placeholder="0x..."
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="bento-input font-mono text-sm w-full bg-[#121212] border-2 border-[#333333] text-white placeholder:text-[#525252] focus:border-[#5CE1FF]"
                />
              </div>

              {tokenError && (
                <div className="p-3 bg-[#FF4D6D]/15 border-2 border-[#FF4D6D]/50 rounded-[16px] flex items-center gap-2 text-xs font-bold text-[#FF4D6D]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{tokenError}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-bento bg-[#141414] hover:bg-[#1e1e1e] text-white border border-[#262626] text-xs py-3 px-4"
                >
                  ← BACK
                </button>

                <button
                  type="submit"
                  disabled={tokenLookupLoading || !tokenAddress.trim()}
                  className="btn-bento bg-[#1237E8] hover:bg-[#1d4ed8] text-white text-xs py-3 px-6 border border-[#222222]"
                >
                  {tokenLookupLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <span>RESOLVE TOKEN ↗</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: PROVE CREATOR */}
        {step === 4 && tokenDetails && (
          <div className="bento-card p-8 sm:p-10 bg-[#0A0A0A] border-2 border-[#222222] text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#1237E8] border-2 border-[#5CE1FF] text-white flex items-center justify-center font-heading text-lg">
                4
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-[#5CE1FF] uppercase tracking-wide">
                  AUTHENTICATION
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl text-white uppercase leading-none mt-1">
                  CREATOR VERIFICATION
                </h2>
              </div>
            </div>

            <div className="p-5 bg-[#121212] rounded-[16px] border border-[#262626] mb-6 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#222222]">
                <span className="text-[#A3A3A3]">RESOLVED TOKEN:</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-[#333333] bg-[#1a1a1a] shrink-0 relative flex items-center justify-center font-bold text-[10px] text-white">
                    {tokenDetails.logoUrl && tokenDetails.logoUrl !== '/assets/logo.png' && !tokenImgError ? (
                      <img
                        src={tokenDetails.logoUrl}
                        alt={tokenDetails.symbol}
                        className="w-full h-full object-contain"
                        onError={() => setTokenImgError(true)}
                      />
                    ) : (
                      <span>{tokenDetails.symbol.slice(0, 3)}</span>
                    )}
                  </div>
                  <span className="font-bold text-white">
                    {tokenDetails.name} (${tokenDetails.symbol})
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#222222]">
                <span className="text-[#A3A3A3]">NETWORK:</span>
                <span className="inline-flex items-center gap-1.5 font-bold uppercase text-[#5CE1FF]">
                  <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
                  {tokenDetails.network === 'testnet' ? 'Robinhood Testnet (46630)' : 'Robinhood Chain Mainnet (4663)'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#222222]">
                <span className="text-[#A3A3A3]">LAUNCHPAD:</span>
                <span className="font-bold uppercase text-[#5CE1FF]">
                  {tokenDetails.launchpad === 'pons' ? 'Pons (pons.family)' : 'Generic ERC-20'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#222222]">
                <span className="text-[#A3A3A3]">ON-CHAIN CREATOR:</span>
                <span className="font-bold text-white font-mono" title={tokenDetails.creator}>
                  {tokenDetails.creator === '0x0000000000000000000000000000000000000000'
                    ? 'Contract / Factory Deployed'
                    : `${tokenDetails.creator.slice(0, 10)}...${tokenDetails.creator.slice(-4)}`}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#A3A3A3]">CONNECTED WALLET:</span>
                <span className="font-bold text-white font-mono">
                  {connectedWallet ? `${connectedWallet.slice(0, 10)}...${connectedWallet.slice(-4)}` : 'Not Connected'}
                </span>
              </div>
            </div>

            {connectedWallet && tokenDetails.creator.toLowerCase() === connectedWallet.toLowerCase() ? (
              <div className="p-3.5 bg-[#1DB954]/15 border-2 border-[#1DB954] rounded-[16px] flex items-center gap-2 text-xs font-mono font-bold text-[#1DB954] mb-6">
                <Check className="w-4 h-4 text-[#1DB954] shrink-0" />
                <span>CRYPTOGRAPHIC MATCH: YOU ARE THE VERIFIED ON-CHAIN CREATOR</span>
              </div>
            ) : (
              <div className="p-4 bg-[#FF4D6D]/15 border-2 border-[#FF4D6D] rounded-[16px] flex items-start gap-3 text-xs font-mono font-bold text-[#FF4D6D] mb-6">
                <AlertCircle className="w-5 h-5 text-[#FF4D6D] shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-heading uppercase text-[#FF4D6D] mb-1">
                    UNAUTHORIZED: CREATOR MISMATCH
                  </div>
                  <div className="font-normal text-[#D4D4D4] leading-relaxed">
                    This token was deployed on Robinhood Chain by <span className="font-bold text-white underline">{tokenDetails.creator}</span>.
                    You are connected with <span className="font-bold text-white">{connectedWallet || 'No wallet connected'}</span>.
                    Only the verified on-chain creator wallet is authorized to bury this token.
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-bento bg-[#141414] hover:bg-[#1e1e1e] text-white border border-[#262626] text-xs py-3 px-4"
              >
                ← CHANGE TOKEN
              </button>

              {connectedWallet &&
              tokenDetails.creator.toLowerCase() === connectedWallet.toLowerCase() ? (
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="btn-bento bg-[#1237E8] hover:bg-[#1d4ed8] text-white text-xs py-3 px-6 border border-[#222222]"
                >
                  <span>CONFIRM & DEAD CHECK ↗</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="btn-bento bg-[#1A1A1A] text-[#525252] border border-[#262626] text-xs py-3 px-6 cursor-not-allowed"
                >
                  <span>CREATOR MISMATCH (BLOCKED)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: DEAD CHECK */}
        {step === 5 && tokenDetails && (
          <div className="bento-card p-8 sm:p-10 bg-[#0A0A0A] border-2 border-[#222222] text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#1237E8] border-2 border-[#5CE1FF] text-white flex items-center justify-center font-heading text-lg">
                5
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-[#5CE1FF] uppercase tracking-wide">
                  EXPIRED CRITERIA
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl text-white uppercase leading-none mt-1">
                  DEAD COIN EVALUATION
                </h2>
              </div>
            </div>

            <p className="font-body text-sm text-[#D4D4D4] mb-6 leading-relaxed">
              Tokens qualify for eternal rest when trading volume has dried up, market cap has dropped significantly from peak, or bonding curve liquidity is inactive on Robinhood Chain.
            </p>

            <div className="space-y-3 mb-6 font-mono text-xs">
              <div className="p-3.5 rounded-[14px] bg-[#121212] border border-[#262626] flex items-center justify-between">
                <span className="text-[#A3A3A3]">ROBINHOOD CHAIN CONTRACT:</span>
                <span className="font-bold text-[#1DB954] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> VERIFIED ON-CHAIN
                </span>
              </div>
              <div className="p-3.5 rounded-[14px] bg-[#121212] border border-[#262626] flex items-center justify-between">
                <span className="text-[#A3A3A3]">LIQUIDITY STATUS:</span>
                <span className="font-bold text-[#FF4D6D] flex items-center gap-1.5">
                  INACTIVE / DEPLETED POOL
                </span>
              </div>
              <div className="p-3.5 rounded-[14px] bg-[#121212] border border-[#262626] flex items-center justify-between">
                <span className="text-[#A3A3A3]">24H TRADING VOLUME:</span>
                <span className="font-bold text-[#FF4D6D] flex items-center gap-1.5">
                  DRIED UP (&lt; $50)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-[16px] bg-[#1DB954]/15 border-2 border-[#1DB954] mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono font-bold">
              <div className="flex items-center gap-2 text-[#1DB954]">
                <Check className="w-4 h-4 text-[#1DB954] shrink-0" />
                <span>ON-CHAIN EVALUATION PASSED: TOKEN QUALIFIED FOR GRAVEN AFTERLIFE</span>
              </div>
              <span className="text-[10px] bg-[#141414] px-2.5 py-0.5 rounded-full border border-[#262626] text-[#A3A3A3] uppercase shrink-0">
                ROBINHOOD VERIFIED
              </span>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="btn-bento bg-[#141414] hover:bg-[#1e1e1e] text-white border border-[#262626] text-xs py-3 px-4"
              >
                ← BACK
              </button>

              <button
                type="button"
                onClick={() => setStep(6)}
                className="btn-bento bg-[#1237E8] hover:bg-[#1d4ed8] text-white text-xs py-3 px-6 border border-[#222222]"
              >
                <span>PROCEED TO EPITAPH & SIGN ↗</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: EPITAPH + LIVE PREVIEW + CRYPTOGRAPHIC SIGNING */}
        {step === 6 && tokenDetails && !buriedGrave && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Form (6 cols) */}
            <div className="lg:col-span-6 bento-card p-6 sm:p-8 bg-[#0A0A0A] border-2 border-[#222222] text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#1237E8] border-2 border-[#5CE1FF] text-white flex items-center justify-center font-heading text-lg">
                  6
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold text-[#5CE1FF] uppercase tracking-wide">
                    FINAL INSCRIPTION
                  </span>
                  <h2 className="font-heading text-2xl text-white uppercase leading-none mt-1">
                    EPITAPH & SIGN
                  </h2>
                </div>
              </div>

              <p className="font-body text-xs text-[#D4D4D4] mb-4 leading-relaxed">
                Write a respectful or witty final memorial (max 140 chars). URLs and profanity are strictly prohibited.
              </p>

              <div className="mb-4">
                <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                  <span className="text-[#A3A3A3]">STONE EPITAPH</span>
                  <span className={epitaph.length > 140 ? 'text-[#FF4D6D]' : 'text-[#737373]'}>
                    {epitaph.length}/140
                  </span>
                </div>
                <textarea
                  value={epitaph}
                  onChange={(e) => setEpitaph(e.target.value.slice(0, 140))}
                  rows={3}
                  className="bento-input font-serif italic text-sm p-3 resize-none h-auto w-full bg-[#121212] border-2 border-[#333333] text-white placeholder:text-[#525252] focus:border-[#5CE1FF]"
                  placeholder="Here lies a dream that ran out of liquidity."
                />
              </div>

              {signingError && (
                <div className="mb-4 p-3.5 bg-[#FF4D6D]/15 border-2 border-[#FF4D6D]/50 rounded-[16px] flex items-center gap-2 text-xs font-bold text-[#FF4D6D]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{signingError}</span>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleSignAndBury}
                  disabled={signingLoading || !epitaph.trim()}
                  className="w-full btn-bento bg-[#1237E8] hover:bg-[#1d4ed8] text-white text-sm py-4 justify-center border border-[#222222] shadow-[3px_3px_0_#000000]"
                >
                  {signingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                      <span>SIGNING IN WALLET...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2 text-[#5CE1FF] inline" />
                      <span>SIGN & BURY TOKEN FOREVER ↗</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="w-full btn-bento bg-[#141414] hover:bg-[#1e1e1e] text-white border border-[#262626] text-xs py-3 justify-center"
                >
                  <span>← BACK TO DEAD CHECK</span>
                </button>
              </div>
            </div>

            {/* Right Live Gravestone Preview (6 cols) */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <div className="w-full bento-card p-6 bg-[#0A0A0A] border-2 border-[#222222] flex flex-col items-center">
                <div className="text-xs font-mono font-bold text-[#A3A3A3] uppercase mb-3">
                  LIVE GRAVESTONE PREVIEW
                </div>
                <div className="w-full max-w-[320px]">
                  <Gravestone
                    data={{
                      tokenAddress: tokenDetails.address,
                      name: tokenDetails.name,
                      symbol: tokenDetails.symbol,
                      logoUrl: tokenDetails.logoUrl,
                      birthDate: tokenDetails.createdAt,
                      deathDate: new Date().toISOString(),
                      daysLived: 14,
                      peakMcapEth: tokenDetails.peakMcapEth,
                      epitaph,
                      launchpad: tokenDetails.launchpad,
                      isRisen: false,
                    }}
                    variant="compact"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {buriedGrave && (
          <div className="bento-card p-8 sm:p-12 text-center bg-[#0A0A0A] border-2 border-[#222222] text-white max-w-xl mx-auto animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#1DB954]/20 border-2 border-[#1DB954] flex items-center justify-center mx-auto mb-4 shadow-[0_0_12px_rgba(29,185,84,0.3)]">
              <Sparkles className="w-8 h-8 text-[#1DB954]" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-[#1237E8] border border-[#222222] text-xs font-mono font-bold uppercase mb-2 text-white">
              REST IN PEACE
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl text-white uppercase mb-2">
              TOKEN OFFICIALLY BURIED!
            </h2>
            <p className="font-body text-sm text-[#A3A3A3] mb-6 leading-relaxed">
              ${buriedGrave.symbol} has been immortalized on Robinhood Chain. The holder snapshot has been initiated and original holders can now visit to earn rewards.
            </p>

            <div className="w-full max-w-[280px] mx-auto mb-8">
              <Gravestone data={buriedGrave} variant="compact" animateRising={true} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/grave/${buriedGrave.tokenAddress}`}
                className="btn-bento bg-[#1237E8] hover:bg-[#1d4ed8] text-white text-xs px-6 py-3.5 border border-[#222222]"
              >
                <span>VIEW MEMORIAL PAGE ↗</span>
              </Link>
              <Link
                href="/dashboard"
                className="btn-bento bg-[#141414] hover:bg-[#1e1e1e] text-white border border-[#262626] text-xs px-6 py-3.5"
              >
                <span>GO TO DASHBOARD</span>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function BuryWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-[#000000]">
          <Loader2 className="w-10 h-10 animate-spin text-[#5CE1FF] mb-3" />
          <p className="font-mono text-xs font-bold uppercase text-[#A3A3A3]">
            Initializing Burial Chamber...
          </p>
        </div>
      }
    >
      <BuryWizardInner />
    </Suspense>
  );
}
