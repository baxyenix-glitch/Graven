'use client';

import React, { useState, useEffect } from 'react';
import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth';
import { robinhoodTestnet, robinhoodMainnet, robinhoodChain } from '@/lib/chain/config';
import { mainnet, sepolia } from 'viem/chains';
import { ActivePrivyBridge, DirectInjectedAuthProvider, isLanInsecureContext } from '@/lib/auth/useAuth';

// Polyfill window.crypto safely and trap unhandled iframe warnings on insecure HTTP origins
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason?.message || event.reason || '');
    if (
      reasonStr.includes('only available over HTTPS') ||
      reasonStr.includes('Embedded wallet')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const errorStr = String(event.message || event.error?.message || '');
    if (
      errorStr.includes('only available over HTTPS') ||
      errorStr.includes('Embedded wallet')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  try {
    if (!window.crypto) {
      (window as any).crypto = {};
    }
    if (!window.crypto.subtle) {
      try {
        Object.defineProperty(window.crypto, 'subtle', {
          value: {
            digest: async (_algo: any, data: BufferSource) => {
              const bytes = new Uint8Array(data as ArrayBuffer);
              const hash = new Uint8Array(32);
              for (let i = 0; i < bytes.length; i++) hash[i % 32] ^= bytes[i];
              return hash.buffer;
            },
            importKey: async () => ({
              type: 'secret',
              extractable: true,
              algorithm: { name: 'AES-GCM' },
              usages: ['encrypt', 'decrypt'],
            }),
            exportKey: async () => new Uint8Array(32).buffer,
            generateKey: async () => ({
              type: 'secret',
              extractable: true,
              algorithm: { name: 'AES-GCM' },
              usages: ['encrypt', 'decrypt'],
            }),
            encrypt: async (_: any, __: any, data: BufferSource) => data,
            decrypt: async (_: any, __: any, data: BufferSource) => data,
            sign: async () => new Uint8Array(64).buffer,
            verify: async () => true,
          },
          configurable: true,
          writable: true,
        });
      } catch {
        // Read-only getter on prototype - safe to ignore
      }
    }
    if (!window.crypto.getRandomValues) {
      try {
        Object.defineProperty(window.crypto, 'getRandomValues', {
          value: (arr: any) => {
            for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
            return arr;
          },
          configurable: true,
          writable: true,
        });
      } catch {
        // Safe to ignore
      }
    }
  } catch {
    // Safe to ignore
  }
}

interface PrivyWrapperProps {
  children: React.ReactNode;
}

interface SafePrivyBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface SafePrivyBoundaryState {
  hasError: boolean;
}

class SafePrivyBoundary extends React.Component<
  SafePrivyBoundaryProps,
  SafePrivyBoundaryState
> {
  constructor(props: SafePrivyBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any): SafePrivyBoundaryState {
    console.warn('[SafePrivyBoundary] Intercepted provider error, activating fallback:', error);
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.warn('[SafePrivyBoundary] Suppressed error info:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
}
}

export function PrivyProvider({ children }: PrivyWrapperProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
  const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

  // Render BasePrivyProvider on all devices (desktop and mobile) so Privy UI modal is always available.
  // In the unlikely event of an unhandled runtime error, SafePrivyBoundary gracefully falls back.
  if (!appId) {
    return <DirectInjectedAuthProvider>{children}</DirectInjectedAuthProvider>;
  }

  return (
    <SafePrivyBoundary fallback={<DirectInjectedAuthProvider>{children}</DirectInjectedAuthProvider>}>
      <BasePrivyProvider
        appId={appId}
        config={{
          loginMethods: ['wallet'],
          appearance: {
            theme: 'light',
            accentColor: '#1237E8',
            logo: '/assets/logo.png',
            showWalletLoginFirst: true,
            walletList: [
              'metamask',
              'coinbase_wallet',
              'rainbow',
              'robinhood_wallet',
              'detected_ethereum_wallets',
              'wallet_connect',
            ],
            walletChainType: 'ethereum-only',
          },
          embeddedWallets: {
            ethereum: {
              createOnLogin: 'off',
            },
            showWalletUIs: false,
          },
          defaultChain: robinhoodMainnet,
          supportedChains: [robinhoodMainnet, mainnet],
          ...(walletConnectProjectId ? { walletConnectProjectId } : {}),
        }}
      >
        <ActivePrivyBridge>{children}</ActivePrivyBridge>
      </BasePrivyProvider>
    </SafePrivyBoundary>
  );
}



