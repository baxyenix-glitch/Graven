'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth, usePrivy, useWallets } from '@/lib/auth/useAuth';
import {
  Wallet,
  ChevronDown,
  LayoutDashboard,
  Copy,
  ExternalLink,
  RefreshCw,
  LogOut,
  Check,
  AlertTriangle,
  Smartphone,
  ShieldAlert,
} from 'lucide-react';
import { robinhoodChain, robinhoodChainId, robinhoodExplorerUrl } from '@/lib/chain/config';
import { toast } from '@/components/ui/Toast';

export interface ConnectButtonProps {
  className?: string;
  variant?: 'navbar-compact' | 'navbar-full' | 'menu-full' | 'card-cta';
  onConnectedAction?: () => void;
}

export function ConnectButton({
  className = '',
  variant = 'navbar-full',
  onConnectedAction,
}: ConnectButtonProps) {
  const { ready, authenticated, user } = usePrivy();
  const { wallets = [] } = useWallets();
  const { login, connectWallet, logout, connectDirectMetaMask, addRobinhoodChain } = useAuth();

  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSecure, setIsSecure] = useState(true);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [readyTimeout, setReadyTimeout] = useState(false);
  const [showDeepLinkModal, setShowDeepLinkModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check secure context and mobile user agent on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocalhost =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const secure = window.isSecureContext !== false || isLocalhost;
      setIsSecure(secure);
      setIsMobileDevice(/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
    }
  }, []);

  // 4-second timeout if Privy takes too long to initialize (e.g. CSP block or offline)
  useEffect(() => {
    if (!ready) {
      const timer = setTimeout(() => {
        setReadyTimeout(true);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setReadyTimeout(false);
    }
  }, [ready]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-reset connecting state after 4 seconds or window refocus so button never freezes
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (connecting) {
      timer = setTimeout(() => {
        setConnecting(false);
      }, 4000);
    }
    const handleFocus = () => setConnecting(false);
    window.addEventListener('focus', handleFocus);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', handleFocus);
    };
  }, [connecting]);

  const activeWallet = wallets?.[0]?.address || user?.wallet?.address;
  const truncated = activeWallet
    ? `${activeWallet.slice(0, 6)}...${activeWallet.slice(-4)}`
    : null;

  const currentChainId = wallets?.[0]?.chainId
    ? Number(String(wallets[0].chainId).replace('eip155:', ''))
    : null;
  const isWrongChain =
    authenticated && activeWallet && currentChainId !== null && currentChainId !== robinhoodChainId;

  // Direct synchronous click handler: NEVER await or setTimeout before login()
  const handleConnectClick = () => {
    setConnectError(null);

    // If already connected, trigger callback
    if (authenticated && onConnectedAction) {
      onConnectedAction();
      return;
    }

    // 1. If inside an in-app browser with injected window.ethereum, connect directly
    const hasInjected = typeof window !== 'undefined' && Boolean((window as any).ethereum);
    if (hasInjected) {
      setConnecting(true);
      connectDirectMetaMask().catch((err) => {
        console.warn('[ConnectButton] Injected connection fallback:', err);
        setConnecting(false);
      });
      return;
    }

    // 2. In insecure LAN context without HTTPS on mobile
    if (!isSecure && isMobileDevice) {
      setShowDeepLinkModal(true);
      toast.warning(
        'Open Graven over HTTPS to connect a wallet.',
        'HTTPS REQUIRED'
      );
      return;
    }

    // 3. Call primary wallet connect synchronously (preserves user gesture for popup/deeplink)
    setConnecting(true);
    try {
      if (typeof login === 'function') {
        login();
      } else if (typeof connectWallet === 'function') {
        connectWallet();
      }
    } catch (err: any) {
      console.error('[ConnectButton] Connection error:', err);
      setConnectError(err?.message || 'Failed to open wallet modal');
      setConnecting(false);
      toast.error(err?.message || 'Wallet connection failed.', 'WALLET ERROR');
    }
  };

  const handleCopy = () => {
    if (activeWallet) {
      navigator.clipboard.writeText(activeWallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSwitchChain = async () => {
    try {
      if (wallets?.[0]?.switchChain) {
        await wallets[0].switchChain(robinhoodChainId);
      } else {
        await addRobinhoodChain();
      }
    } catch (err: any) {
      console.warn('Network switch error:', err);
      await addRobinhoodChain();
    }
  };

  // Connected state with dropdown
  if (authenticated && activeWallet) {
    if (variant === 'navbar-compact') {
      return (
        <div className="relative h-full" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-label="Connected Wallet Menu"
            className={`h-full px-3.5 bg-[#1237E8] text-white font-ui font-bold text-xs flex items-center gap-2 border-l-[3px] border-[#222222] cursor-pointer active:bg-[#0A1FC4] touch-manipulation ${className}`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full border border-[#000000] ${
                isWrongChain ? 'bg-[#FF9CCB] animate-pulse' : 'bg-[#1DB954]'
              }`}
            />
            <span>{truncated}</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/80" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0A0A0A] border-[2px] border-[#222222] rounded-[20px] shadow-[6px_6px_0_#000000] p-2.5 z-[90] text-sm text-white animate-fade-in">
              <div className="px-3 py-2 border-b border-[#222222] mb-1.5">
                <span className="text-[10px] font-ui text-[#A3A3A3] uppercase font-bold block">
                  NETWORK
                </span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isWrongChain ? 'bg-[#FF9CCB]' : 'bg-[#1DB954]'
                    }`}
                  />
                  {robinhoodChain.name}
                </span>
              </div>

              {isWrongChain && (
                <button
                  type="button"
                  onClick={handleSwitchChain}
                  className="w-full mb-2 p-2 bg-[#FF4D6D] text-white rounded-[12px] border border-[#222222] text-xs font-ui font-bold flex items-center justify-between cursor-pointer"
                >
                  <span>SWITCH TO ROBINHOOD</span>
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleCopy}
                className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-xs font-bold font-ui text-white hover:bg-[#1A1A1A] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Copy className="w-4 h-4 text-[#A3A3A3]" />
                  <span>{copied ? 'COPIED!' : 'COPY ADDRESS'}</span>
                </span>
                {copied && <Check className="w-3.5 h-3.5 text-[#1DB954]" />}
              </button>

              <a
                href={`${robinhoodExplorerUrl}/address/${activeWallet}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-[12px] text-xs font-bold font-ui text-white hover:bg-[#1A1A1A]"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-[#A3A3A3]" />
                  <span>EXPLORER</span>
                </span>
                <span className="text-[10px] text-[#A3A3A3]">↗</span>
              </a>

              <div className="pt-2 mt-2 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-xs font-bold font-ui text-[#FF4D6D] hover:bg-[#FF4D6D]/15 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-[#FF4D6D]" />
                    <span>DISCONNECT</span>
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Desktop navbar connected state
    if (variant === 'navbar-full') {
      return (
        <div className={`relative font-ui ${className}`} ref={dropdownRef}>
          <div className="p-2 px-3.5 rounded-[14px] bg-[#0A0A0A] border-[2px] border-[#222222] flex items-center gap-2.5 shadow-[2px_2px_0_#000000]">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 text-xs font-mono font-bold text-white hover:text-[#5CE1FF] cursor-pointer"
              title="Wallet Details & Options"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full border border-[#000000] ${
                  isWrongChain ? 'bg-[#FF9CCB] animate-pulse' : 'bg-[#1DB954]'
                }`}
                title={isWrongChain ? 'Wrong Network - Click to switch to Robinhood' : robinhoodChain.name}
              />
              <span>{truncated}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#A3A3A3] transition-transform duration-150 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div className="w-[1.5px] h-3.5 bg-[#262626]" />

            <button
              type="button"
              onClick={handleCopy}
              className="text-xs font-bold text-[#5CE1FF] hover:text-white cursor-pointer"
              title="Copy Address"
            >
              {copied ? 'COPIED' : 'COPY'}
            </button>

            <div className="w-[1.5px] h-3.5 bg-[#262626]" />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(false);
                logout();
              }}
              className="text-[#FF4D6D] hover:bg-[#FF4D6D]/15 p-1 rounded-md transition-colors cursor-pointer flex items-center"
              title="Disconnect Wallet"
              aria-label="Disconnect Wallet"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0A0A0A] border-[2px] border-[#222222] rounded-[20px] shadow-[6px_6px_0_#000000] p-3 z-[90] text-sm text-white animate-fade-in">
              <div className="px-3 py-2 border-b border-[#222222] mb-1.5">
                <span className="text-[10px] font-ui text-[#A3A3A3] uppercase font-bold block">
                  NETWORK
                </span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isWrongChain ? 'bg-[#FF9CCB]' : 'bg-[#1DB954]'
                    }`}
                  />
                  {robinhoodChain.name}
                </span>
              </div>

              {isWrongChain && (
                <button
                  type="button"
                  onClick={handleSwitchChain}
                  className="w-full mb-2 p-2 bg-[#FF4D6D] text-white rounded-[12px] border border-[#222222] text-xs font-ui font-bold flex items-center justify-between cursor-pointer"
                >
                  <span>SWITCH TO ROBINHOOD</span>
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleCopy}
                className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-xs font-bold font-ui text-white hover:bg-[#1A1A1A] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Copy className="w-4 h-4 text-[#A3A3A3]" />
                  <span>{copied ? 'COPIED!' : 'COPY ADDRESS'}</span>
                </span>
                {copied && <Check className="w-3.5 h-3.5 text-[#1DB954]" />}
              </button>

              <a
                href={`${robinhoodExplorerUrl}/address/${activeWallet}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-[12px] text-xs font-bold font-ui text-white hover:bg-[#1A1A1A]"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-[#A3A3A3]" />
                  <span>EXPLORER</span>
                </span>
                <span className="text-[10px] text-[#A3A3A3]">↗</span>
              </a>

              <div className="pt-2 mt-2 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-xs font-bold font-ui text-[#FF4D6D] hover:bg-[#FF4D6D]/15 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-[#FF4D6D]" />
                    <span>DISCONNECT WALLET</span>
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Full card / menu connected state
    return (
      <div className={`space-y-2 font-ui ${className}`} ref={dropdownRef}>
        <div className="p-3 rounded-[16px] bg-[#141414] border-[2px] border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full border border-[#000000] ${
                isWrongChain ? 'bg-[#FF9CCB]' : 'bg-[#1DB954]'
              }`}
            />
            <span className="text-xs font-mono font-bold text-white">{truncated}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs font-bold text-[#5CE1FF] underline cursor-pointer hover:text-white"
          >
            {copied ? 'COPIED' : 'COPY'}
          </button>
        </div>

        <div className="flex gap-2">
          <Link
            href="/dashboard"
            className="btn-bento btn-cyan flex-1 py-2.5 text-xs justify-center"
          >
            <span>DASHBOARD</span>
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(false);
              logout();
            }}
            className="btn-bento bg-[#1A1A1A] border-[2px] border-[#262626] px-3 py-2.5 text-xs text-[#FF4D6D] hover:bg-[#222222] justify-center"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Connecting state
  if (connecting) {
    return (
      <button
        type="button"
        disabled
        className={`btn-bento btn-cobalt opacity-90 cursor-wait text-xs py-2 px-4 ${className}`}
      >
        <span className="w-2 h-2 rounded-full bg-[#E4FF6B] animate-pulse" />
        <span>CONNECTING...</span>
      </button>
    );
  }

  // Error state with retry
  if (connectError) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleConnectClick}
          className={`btn-bento btn-lime text-xs py-2 px-3 ${className}`}
          title={connectError}
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#0A0F2E]" />
          <span>RETRY CONNECT</span>
        </button>
      </div>
    );
  }

  // Not ready for > 4s: show Retry Connect button
  if (!ready && readyTimeout) {
    return (
      <button
        type="button"
        onClick={handleConnectClick}
        className={`btn-bento btn-lime text-xs py-2 px-3 ${className}`}
        title="Privy initialization timed out. Click to retry."
      >
        <RefreshCw className="w-3.5 h-3.5 text-[#0A0F2E]" />
        <span>RETRY CONNECT</span>
      </button>
    );
  }

  // Not ready for < 4s: show Connecting...
  if (!ready) {
    return (
      <button
        type="button"
        disabled
        className={`btn-bento btn-cobalt opacity-80 cursor-wait text-xs py-2 px-3 ${className}`}
      >
        <span className="w-2 h-2 rounded-full bg-[#5CE1FF] animate-pulse" />
        <span>CONNECTING...</span>
      </button>
    );
  }

  // Disconnected / Ready to connect
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const cleanHost = typeof window !== 'undefined' ? (window.location.host + window.location.pathname) : '';
  const mmDeepLink = `https://metamask.app.link/dapp/${cleanHost}`;
  const cbDeepLink = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(currentUrl)}`;

  return (
    <>
      {/* HTTPS Requirement / Mobile Deep Link Modal */}
      {showDeepLinkModal && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#0A0A0A] border-[3px] border-[#262626] rounded-[24px] p-6 shadow-[6px_6px_0_#000000] text-white">
            <div className="w-12 h-12 rounded-full bg-[#FF4D6D]/20 border-[2px] border-[#FF4D6D] flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6 text-[#FF4D6D]" />
            </div>

            <h3 className="font-heading text-xl uppercase mb-2">HTTPS REQUIRED</h3>
            <p className="font-body text-xs text-[#A3A3A3] mb-6 leading-relaxed">
              Open Graven over HTTPS to connect a wallet. On mobile browsers over plain HTTP, Web3 wallet crypto APIs are disabled by the browser security sandbox.
            </p>

            <div className="space-y-2.5 mb-4">
              <a
                href={mmDeepLink}
                target="_blank"
                rel="noreferrer"
                className="w-full btn-bento btn-cyan text-xs py-3 justify-center"
              >
                <Smartphone className="w-4 h-4 mr-1.5" />
                <span>OPEN IN METAMASK ↗</span>
              </a>
              <a
                href={cbDeepLink}
                target="_blank"
                rel="noreferrer"
                className="w-full btn-bento btn-cobalt text-xs py-3 justify-center"
              >
                <Smartphone className="w-4 h-4 mr-1.5" />
                <span>OPEN IN COINBASE WALLET ↗</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setShowDeepLinkModal(false)}
              className="w-full btn-bento bg-[#141414] text-[#A3A3A3] border border-[#262626] text-xs py-2.5 justify-center hover:text-white"
            >
              <span>CLOSE</span>
            </button>
          </div>
        </div>
      )}

      {/* Button rendering based on variant */}
      {variant === 'navbar-compact' ? (
        <button
          type="button"
          onClick={handleConnectClick}
          aria-label="Connect Web3 Wallet"
          className={`h-full px-3.5 bg-[#1237E8] text-white font-ui font-bold text-xs flex items-center gap-1.5 border-l-[3px] border-[#222222] cursor-pointer hover:bg-[#0A1FC4] active:bg-[#0A0F2E] touch-manipulation select-none ${className}`}
        >
          <Wallet className="w-3.5 h-3.5 text-[#5CE1FF]" />
          <span>CONNECT</span>
        </button>
      ) : variant === 'menu-full' ? (
        <button
          type="button"
          onClick={handleConnectClick}
          className={`btn-bento btn-cobalt w-full py-3.5 text-xs justify-center select-none ${className}`}
        >
          <Wallet className="w-4 h-4" />
          <span>CONNECT WALLET →</span>
        </button>
      ) : variant === 'card-cta' ? (
        <button
          type="button"
          onClick={handleConnectClick}
          className={`btn-bento btn-cyan py-3 px-6 text-xs select-none ${className}`}
        >
          <Wallet className="w-4 h-4" />
          <span>CONNECT WALLET ↗</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleConnectClick}
          className={`btn-bento btn-cyan py-2.5 px-5 text-xs select-none ${className}`}
        >
          <Wallet className="w-4 h-4" />
          <span>CONNECT WALLET</span>
        </button>
      )}
    </>
  );
}
