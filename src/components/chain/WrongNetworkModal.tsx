'use client';

import React from 'react';
import { useAuth, usePrivy, useWallets } from '@/lib/auth/useAuth';
import { robinhoodChainId, robinhoodChain } from '@/lib/chain/config';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export function WrongNetworkModal() {
  const { authenticated } = usePrivy();
  const { wallets = [] } = useWallets();
  const { addRobinhoodChain } = useAuth();
  const [dismissed, setDismissed] = React.useState(false);

  const activeWallet = wallets?.[0];
  const currentChainId = activeWallet?.chainId ? Number(String(activeWallet.chainId).replace('eip155:', '')) : null;

  const isWrongChain = authenticated && activeWallet && currentChainId !== null && currentChainId !== robinhoodChainId;

  if (!isWrongChain || dismissed) {
    return null;
  }

  const handleSwitch = async () => {
    try {
      if (activeWallet?.switchChain) {
        await activeWallet.switchChain(robinhoodChainId);
      } else {
        await addRobinhoodChain();
      }
    } catch (err: any) {
      console.warn('Standard switch failed, trying direct chain add:', err);
      await addRobinhoodChain();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-[#000000]/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-[#0A0A0A] border-t-[3px] sm:border-[2px] border-[#222222] sm:rounded-[28px] rounded-t-[28px] p-6 sm:p-8 shadow-[0_8px_0_#000000] sm:shadow-[8px_8px_0_#000000] relative text-white">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss network warning"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 cursor-pointer text-[#A3A3A3] hover:text-white"
        >
          ✕
        </button>

        <div className="w-14 h-14 rounded-full bg-[#FF4D6D]/20 border-[2px] border-[#FF4D6D] shadow-[3px_3px_0_#000000] flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-[#FF4D6D]" />
        </div>

        <div className="text-center">
          <div className="bento-pill bg-[#1237E8] text-white border-[#222222] mb-2 mx-auto">
            NETWORK MISMATCH
          </div>
          <h2 className="font-heading text-2xl md:text-3xl text-white mb-2 uppercase">
            SWITCH TO ROBINHOOD CHAIN
          </h2>
          <p className="font-body text-[#A3A3A3] text-sm mb-6">
            Graven is exclusively built on {robinhoodChain.name} (Chain ID: {robinhoodChainId}). Please switch your connected wallet to continue.
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleSwitch}
              className="w-full btn-bento btn-cyan text-sm sm:text-base py-3 justify-center"
            >
              <span>SWITCH TO {robinhoodChain.name.toUpperCase()}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="w-full btn-bento bg-transparent border border-[#262626] text-xs py-2 justify-center text-[#A3A3A3] hover:text-white hover:bg-white/5"
            >
              CONTINUE AS READ-ONLY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
