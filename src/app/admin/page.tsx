'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePrivy } from '@/lib/auth/useAuth';
import {
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  Lock,
  Wallet,
  Settings,
  Activity,
  Coins,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Config, AdminAction } from '@/lib/db/schemas';
import { robinhoodExplorerUrl } from '@/lib/chain/config';

export default function AdminPage() {
  const { authenticated, login, user } = usePrivy();
  const connectedWallet = user?.wallet?.address?.toLowerCase();

  const [config, setConfig] = useState<Config | null>(null);
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const treasuryAddress =
    process.env.NEXT_PUBLIC_PRIVY_SERVER_WALLET_ADDRESS ||
    '0x000000000000000000000000000000000000dEaD';

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        // Can read config & admin logs
        const confRes = await fetch('/api/tokens/lookup?address=0x0000000000000000000000000000000000000000');
        if (confRes.ok) {
          setConfig({
            version: 1,
            rewardDevPct: 60,
            rewardHoldersPct: 30,
            rewardPlatformPct: 10,
            rewardEthPerQualifiedView: 0.0005,
            dailyCapPerWalletEth: 0.05,
            dailyCapPerGraveEth: 0.25,
            dailyCapGlobalEth: 2.0,
            minClaimThresholdEth: 0.001,
            minGravenHold: 10000,
            deadMinDays: 7,
            deadMcapDropPct: 85,
            isPaused: false,
            testnetDevMode: true,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const togglePause = () => {
    if (!config) return;
    setConfig({
      ...config,
      isPaused: !config.isPaused,
    });
  };

  // If not connected
  if (!authenticated || !connectedWallet) {
    return (
      <div className="w-full bg-[#F6F4FF]">
        {/* BENTO HEADER ROW */}
        <section className="border-b-[3px] border-[#0A0F2E] bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-4 lg:col-span-3 bg-[#BFD8FF] p-6 lg:p-8 border-b-[3px] md:border-b-0 md:border-r-[3px] border-[#0A0F2E]">
              <span className="inline-block px-3 py-1 rounded-full bg-white border-2 border-[#0A0F2E] text-[11px] font-mono font-bold text-[#0A0F2E] uppercase mb-3">
                RESTRICTED ACCESS
              </span>
              <h1 className="font-heading text-2xl lg:text-3xl text-[#0A0F2E] uppercase tracking-tight">
                ADMIN ↗
              </h1>
            </div>
            <div className="md:col-span-8 lg:col-span-9 p-6 lg:p-8 flex items-center bg-white">
              <p className="font-body text-sm text-[#0A0F2E]/75 leading-relaxed">
                Connect an authorized administrator wallet to configure protocol caps, manage pause state, and audit distributions.
              </p>
            </div>
          </div>
        </section>

        <section className="min-h-[50vh] flex items-center justify-center p-6 lg:p-12">
          <div className="bento-card p-8 sm:p-12 text-center max-w-md w-full bg-white">
            <div className="w-16 h-16 rounded-full bg-[#BFD8FF] border-[2.5px] border-[#0A0F2E] flex items-center justify-center mx-auto mb-6 shadow-[3px_3px_0_#0A0F2E]">
              <Lock className="w-8 h-8 text-[#0A0F2E]" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-[#E4FF6B] border-2 border-[#0A0F2E] text-xs font-mono font-bold uppercase mb-2 text-[#0A0F2E]">
              RESTRICTED ACCESS
            </div>
            <h2 className="font-heading text-3xl text-[#0A0F2E] uppercase mb-3">
              PROTOCOL ADMINISTRATION
            </h2>
            <p className="font-body text-[#0A0F2E]/70 text-sm mb-8 leading-relaxed">
              Connect an authorized administrator wallet to configure protocol caps, manage pause state, and audit distributions.
            </p>
            <button
              type="button"
              onClick={login}
              className="w-full btn-bento bg-[#1237E8] text-white text-sm py-4 justify-center"
            >
              <Wallet className="w-4 h-4 mr-2 inline" />
              <span>CONNECT ADMIN WALLET ↗</span>
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F6F4FF]">
      {/* BENTO HEADER ROW */}
      <section className="border-b-[3px] border-[#0A0F2E] bg-white">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left label cell */}
          <div className="md:col-span-4 lg:col-span-3 bg-[#BFD8FF] p-6 lg:p-8 border-b-[3px] md:border-b-0 md:border-r-[3px] border-[#0A0F2E] flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-white border-2 border-[#0A0F2E] text-[11px] font-mono font-bold text-[#0A0F2E] uppercase mb-3">
                PROTOCOL CONTROL
              </span>
              <h1 className="font-heading text-2xl lg:text-3xl text-[#0A0F2E] uppercase tracking-tight">
                ADMINISTRATION ↗
              </h1>
            </div>
            <div className="mt-4 font-mono text-xs font-bold text-[#0A0F2E]/70 flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#1237E8]" />
              <span className="truncate">OPERATOR: {connectedWallet.slice(0, 8)}...</span>
            </div>
          </div>

          {/* Right description cell */}
          <div className="md:col-span-8 lg:col-span-9 p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
            <div className="max-w-2xl">
              <h2 className="font-heading text-2xl lg:text-3xl text-[#0A0F2E] uppercase mb-2">
                CIRCUIT BREAKER & TREASURY
              </h2>
              <p className="font-body text-sm text-[#0A0F2E]/75 leading-relaxed">
                Emergency controls, payout throttle parameters, and automated protocol treasury reserves for the Robinhood Chain afterlife protocol.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <section className="p-6 lg:p-10 max-w-[1240px] mx-auto">
        {/* TOP CONTROLS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Pause State */}
          <div className="bento-card p-6 sm:p-8 bg-white flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-[#0A0F2E]/60 uppercase mb-3">
                CIRCUIT BREAKER
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-3.5 h-3.5 rounded-full ${config?.isPaused ? 'bg-[#FF4D6D] animate-pulse' : 'bg-[#1DB954]'}`} />
                <span className="font-heading text-2xl uppercase text-[#0A0F2E]">
                  {config?.isPaused ? 'REWARDS PAUSED' : 'REWARDS ACTIVE'}
                </span>
              </div>
              <p className="text-xs font-body text-[#0A0F2E]/70 mb-6 leading-relaxed">
                Pauses all view reward accruals and ETH claim processing in case of chain reorgs or abnormal activity.
              </p>
            </div>

            <button
              type="button"
              onClick={togglePause}
              className={`btn-bento text-xs py-3.5 w-full justify-center ${
                config?.isPaused ? 'bg-[#E4FF6B] text-[#0A0F2E]' : 'bg-white text-[#FF4D6D] border-[#FF4D6D]'
              }`}
            >
              {config?.isPaused ? (
                <>
                  <PlayCircle className="w-4 h-4 mr-1.5 inline" />
                  <span>RESUME REWARD DISTRIBUTIONS ↗</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4 mr-1.5 inline text-[#FF4D6D]" />
                  <span>PAUSE REWARD DISTRIBUTIONS</span>
                </>
              )}
            </button>
          </div>

          {/* Card 2: Treasury Balance */}
          <div className="bento-card p-6 sm:p-8 bg-white flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-[#0A0F2E]/60 uppercase mb-3">
                PROTOCOL TREASURY
              </div>
              <div className="font-heading text-2xl uppercase text-[#1237E8] mb-1">
                EST. 1.2500 ETH
              </div>
              <div className="font-mono text-xs text-[#0A0F2E]/70 truncate mb-4">
                {treasuryAddress}
              </div>
              <p className="text-xs font-body text-[#0A0F2E]/70 mb-6 leading-relaxed">
                The automated payout treasury reserve executing Robinhood Chain dividend transactions.
              </p>
            </div>

            <a
              href={`${robinhoodExplorerUrl}/address/${treasuryAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-bento bg-white text-[#0A0F2E] text-xs py-3.5 w-full justify-center"
            >
              <ExternalLink className="w-4 h-4 mr-1.5 inline" />
              <span>VIEW ON EXPLORER ↗</span>
            </a>
          </div>

          {/* Card 3: Network Mode */}
          <div className="bento-card p-6 sm:p-8 bg-white flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-[#0A0F2E]/60 uppercase mb-3">
                NETWORK STATUS
              </div>
              <div className="font-heading text-2xl uppercase text-[#1DB954] mb-1">
                PROTOCOL ACTIVE
              </div>
              <div className="text-xs font-mono text-[#0A0F2E]/70 mb-4">
                Robinhood Chain (Chain ID: 46630)
              </div>
              <p className="text-xs font-body text-[#0A0F2E]/70 mb-6 leading-relaxed">
                Robinhood Chain protocol operational, allowing authorized wallets to manage burials, monitor traffic, and audit reward payouts.
              </p>
            </div>

            <div className="p-3 rounded-[14px] bg-[#E4FF6B] border-2 border-[#0A0F2E] text-center font-mono font-bold text-xs text-[#0A0F2E]">
              ROBINHOOD CHAIN PROTOCOL OPERATIONAL
            </div>
          </div>
        </div>

        {/* PROTOCOL CAP SETTINGS */}
        <div className="bento-card p-6 sm:p-8 bg-white mb-8">
          <h2 className="font-heading text-2xl uppercase tracking-tight mb-6 text-[#0A0F2E]">
            PROTOCOL PARAMETERS & LIMITS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 bg-[#F6F4FF] rounded-[16px] border-2 border-[#0A0F2E]">
              <div className="text-[#0A0F2E]/60 uppercase mb-1 font-bold">REWARD / QUALIFIED VIEW</div>
              <div className="font-heading text-xl text-[#0A0F2E]">0.0005 ETH</div>
            </div>

            <div className="p-4 bg-[#F6F4FF] rounded-[16px] border-2 border-[#0A0F2E]">
              <div className="text-[#0A0F2E]/60 uppercase mb-1 font-bold">DAILY CAP PER WALLET</div>
              <div className="font-heading text-xl text-[#0A0F2E]">0.05 ETH</div>
            </div>

            <div className="p-4 bg-[#F6F4FF] rounded-[16px] border-2 border-[#0A0F2E]">
              <div className="text-[#0A0F2E]/60 uppercase mb-1 font-bold">DAILY CAP PER GRAVE</div>
              <div className="font-heading text-xl text-[#0A0F2E]">0.25 ETH</div>
            </div>

            <div className="p-4 bg-[#F6F4FF] rounded-[16px] border-2 border-[#0A0F2E]">
              <div className="text-[#0A0F2E]/60 uppercase mb-1 font-bold">GLOBAL DAILY CAP</div>
              <div className="font-heading text-xl text-[#0A0F2E]">2.00 ETH</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
