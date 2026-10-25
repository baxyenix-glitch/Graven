'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePrivy as useBasePrivy, useWallets as useBaseWallets, useConnectWallet } from '@privy-io/react-auth';
import { robinhoodChainId, robinhoodChain, robinhoodRpcUrl, robinhoodExplorerUrl } from '@/lib/chain/config';
import { toast } from '@/components/ui/Toast';

export interface AuthContextType {
  ready: boolean;
  authenticated: boolean;
  user: any;
  wallets: any[];
  activeWallet: string | null;
  login: () => void;
  connectWallet: () => void;
  logout: () => void;
  signMessage: (params: { message: string } | string) => Promise<string>;
  getAccessToken: () => Promise<string | null>;
  isMock: boolean;
  showHttpsNotice: boolean;
  setShowHttpsNotice: (show: boolean) => void;
  connectDirectMetaMask: () => Promise<string | null>;
  addRobinhoodChain: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({
  ready: true,
  authenticated: false,
  user: null,
  wallets: [],
  activeWallet: null,
  login: () => {},
  connectWallet: () => {},
  logout: () => {},
  signMessage: async () => '',
  getAccessToken: async () => null,
  isMock: false,
  showHttpsNotice: false,
  setShowHttpsNotice: () => {},
  connectDirectMetaMask: async () => null,
  addRobinhoodChain: async () => false,
});

export function isLanInsecureContext(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.protocol === 'http:' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  );
}

export function getInjectedProvider(): any {
  if (typeof window === 'undefined') return null;
  const eth = (window as any).ethereum;
  if (!eth) return null;
  if (Array.isArray(eth.providers) && eth.providers.length > 0) {
    const mm = eth.providers.find((p: any) => p.isMetaMask);
    if (mm) return mm;
    return eth.providers[0];
  }
  return eth;
}

// Directly register or switch to Robinhood Chain in MetaMask/EVM wallet
export async function addRobinhoodChainToWallet(): Promise<boolean> {
  const ethereum = getInjectedProvider();
  if (!ethereum) {
    return false;
  }
  const hexChainId = `0x${robinhoodChainId.toString(16)}`;
  try {
    // 1. First try switching to Robinhood Chain if already added
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
      return true;
    } catch (switchError: any) {
      // Error code 4902 or unrecognized chain indicates that the chain has not been added yet
      const code = switchError?.code || switchError?.data?.originalError?.code;
      if (
        code === 4902 ||
        switchError?.message?.includes('Unrecognized') ||
        switchError?.message?.includes('4902') ||
        switchError?.message?.includes('wallet_addEthereumChain')
      ) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: hexChainId,
              chainName: robinhoodChain.name,
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: [robinhoodRpcUrl],
              blockExplorerUrls: [robinhoodExplorerUrl],
            },
          ],
        });
        return true;
      }
      throw switchError;
    }
  } catch (err) {
    console.warn('Could not add Robinhood Chain automatically:', err);
    return false;
  }
}

// Internal provider that extracts state from active BasePrivyProvider
export function ActivePrivyBridge({ children }: { children: React.ReactNode }) {
  const privy = useBasePrivy();
  const { ready, authenticated: privyAuthenticated, user, login: privyLogin, logout: privyLogout } = privy;
  const { wallets = [] } = useBaseWallets();
  const [directWallet, setDirectWallet] = useState<string | null>(null);
  const [isDisconnected, setIsDisconnected] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('graven_disconnected') === 'true';
    }
    return false;
  });

  // Hook into connectWallet so Privy opens its wallet selection modal without demanding backend SIWE signature
  const { connectWallet: privyConnectWallet } = useConnectWallet({
    onSuccess: async (params: any) => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('graven_disconnected');
      }
      setIsDisconnected(false);
      const walletObj = params?.wallet || params;
      const addr = walletObj?.address;
      console.log('[Privy] Wallet successfully connected:', addr);
      if (addr) {
        setDirectWallet(addr);
      }
      try {
        await addRobinhoodChainToWallet();
      } catch (err) {
        console.warn('Could not auto-switch network to Robinhood Chain:', err);
      }
    },
    onError: (error) => {
      console.warn('[Privy] connectWallet error:', error);
    },
  });

  // Keep directWallet synced whenever Privy wallets array updates
  useEffect(() => {
    if (!isDisconnected && wallets && wallets.length > 0 && wallets[0]?.address) {
      setDirectWallet(wallets[0].address);
    }
  }, [wallets, isDisconnected]);

  // Check for already-connected browser wallet extension on mount & listen to changes
  useEffect(() => {
    if (isDisconnected) return;
    const ethereum = getInjectedProvider();
    if (ethereum) {
      ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts[0] && !isDisconnected) {
            setDirectWallet(accounts[0]);
          }
        })
        .catch(() => {});

      const handleAccounts = (accounts: string[]) => {
        if (accounts && accounts[0] && !isDisconnected) {
          setDirectWallet(accounts[0]);
        } else {
          setDirectWallet(null);
        }
      };

      ethereum.on?.('accountsChanged', handleAccounts);
      return () => {
        ethereum.removeListener?.('accountsChanged', handleAccounts);
      };
    }
  }, [isDisconnected]);

  const rawActiveWallet =
    wallets?.[0]?.address || directWallet || user?.wallet?.address || null;
  const activeWallet = isDisconnected ? null : rawActiveWallet;

  // Direct MetaMask connection (available via 🦊 icon)
  const connectDirectMetaMask = useCallback(async (): Promise<string | null> => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('graven_disconnected');
    }
    setIsDisconnected(false);
    const ethereum = getInjectedProvider();
    if (!ethereum) {
      try {
        if (typeof privyConnectWallet === 'function') {
          privyConnectWallet();
        } else {
          privyLogin();
        }
      } catch (err) {
        toast.warning(
          'No EVM wallet extension detected. Please install MetaMask or Rabby.',
          'WALLET NOT DETECTED'
        );
      }
      return null;
    }
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts[0]) {
        const addr = accounts[0];
        setDirectWallet(addr);
        await addRobinhoodChainToWallet();
        return addr;
      }
    } catch (err: any) {
      console.error('Direct wallet connection error:', err);
    }
    return null;
  }, [privyConnectWallet, privyLogin]);

  // Primary Connect Wallet action: ALWAYS opens the Privy modal directly on desktop & mobile!
  const connectWallet = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('graven_disconnected');
    }
    setIsDisconnected(false);
    try {
      if (typeof privyConnectWallet === 'function') {
        privyConnectWallet();
      } else if (typeof privyLogin === 'function') {
        privyLogin();
      }
    } catch (err) {
      console.warn('Error opening Privy connect modal:', err);
      try {
        privyLogin();
      } catch {}
    }
  }, [privyConnectWallet, privyLogin]);

  const login = connectWallet;

  const logout = useCallback(async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('graven_disconnected', 'true');
    }
    setIsDisconnected(true);
    setDirectWallet(null);

    // 1. Explicitly disconnect any connected wallets returned by Privy
    try {
      if (wallets && wallets.length > 0) {
        await Promise.all(
          wallets.map((w: any) => {
            if (typeof w?.disconnect === 'function') {
              return w.disconnect().catch(() => {});
            }
            return Promise.resolve();
          })
        );
      }
    } catch (err) {
      console.warn('Error disconnecting wallets:', err);
    }

    // 2. Log out of Privy session
    try {
      if (typeof privyLogout === 'function') {
        await privyLogout();
      }
    } catch (err) {
      console.warn('Error logging out of Privy:', err);
    }

    toast.info('Wallet disconnected.', 'DISCONNECTED');
  }, [wallets, privyLogout]);

  const signMessage = useCallback(
    async (params: { message: string } | string): Promise<string> => {
      const messageStr = typeof params === 'string' ? params : params.message;
      const ethereum = getInjectedProvider();
      if (ethereum) {
        try {
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          const signerAddr = accounts?.[0] || activeWallet;
          if (signerAddr) {
            return await ethereum.request({
              method: 'personal_sign',
              params: [messageStr, signerAddr],
            });
          }
        } catch (err) {
          console.warn('Injected personal_sign failed, falling back to Privy:', err);
        }
      }
      if (privy.signMessage) {
        try {
          const res = await privy.signMessage({ message: messageStr });
          return typeof res === 'string' ? res : (res as any)?.signature || String(res);
        } catch (err) {
          console.warn('Privy signMessage failed:', err);
        }
      }
      throw new Error('No wallet available to sign message');
    },
    [privy, activeWallet]
  );

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (privy.getAccessToken) {
      try {
        const token = await privy.getAccessToken();
        if (token) return token;
      } catch {
        // Fall back to connected wallet address
      }
    }
    if (activeWallet) return activeWallet;
    if (user?.wallet?.address) return user.wallet.address;
    return null;
  }, [privy, activeWallet, user]);

  const effectiveWallets = isDisconnected
    ? []
    : wallets && wallets.length > 0
    ? wallets
    : activeWallet
    ? [
        {
          address: activeWallet,
          chainId: `eip155:${robinhoodChainId}`,
          switchChain: async () => addRobinhoodChainToWallet(),
        },
      ]
    : [];

  const isAuthenticated = !isDisconnected && Boolean(privyAuthenticated || activeWallet || directWallet);

  return (
    <AuthContext.Provider
      value={{
        ready,
        authenticated: isAuthenticated,
        user: isDisconnected ? null : (user || (activeWallet ? { wallet: { address: activeWallet } } : null)),
        wallets: effectiveWallets,
        activeWallet,
        login,
        connectWallet,
        logout,
        signMessage,
        getAccessToken,
        isMock: false,
        showHttpsNotice: false,
        setShowHttpsNotice: () => {},
        connectDirectMetaMask,
        addRobinhoodChain: addRobinhoodChainToWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Provider for mobile wallet explorers (MetaMask Mobile, Rainbow, Rabby, Coinbase Wallet)
// and resilient fallback for insecure LAN HTTP origins (e.g. http://10.164.123.60:3000)
export function DirectInjectedAuthProvider({ children }: { children: React.ReactNode }) {
  const [isDisconnected, setIsDisconnected] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('graven_disconnected') === 'true';
    }
    return false;
  });
  const [activeWallet, setActiveWallet] = useState<string | null>(null);
  const [ready, setReady] = useState(true);

  // Check for injected window.ethereum on mount
  useEffect(() => {
    if (isDisconnected) return;
    const ethereum = getInjectedProvider();
    if (ethereum) {
      ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts[0] && !isDisconnected) {
            setActiveWallet(accounts[0]);
          }
        })
        .catch(() => {});

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts && accounts[0] && !isDisconnected) {
          setActiveWallet(accounts[0]);
        } else {
          setActiveWallet(null);
        }
      };

      ethereum.on?.('accountsChanged', handleAccountsChanged);
      return () => {
        ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      };
    }
  }, [isDisconnected]);

  const login = useCallback(async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('graven_disconnected');
    }
    setIsDisconnected(false);
    const ethereum = getInjectedProvider();
    if (!ethereum) {
      const isMobile =
        typeof navigator !== 'undefined' &&
        /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
      if (isMobile) {
        toast.modal(
          'To connect on mobile, please open Graven inside MetaMask or Rainbow app built-in browser, or access over an HTTPS link.',
          'CONNECT ON MOBILE',
          {
            type: 'warning',
            actionLabel: 'OPEN IN METAMASK ↗',
            onAction: () => {
              if (typeof window !== 'undefined') {
                const targetUrl = window.location.href.replace(/^https?:\/\//, '');
                window.location.href = `https://metamask.app.link/dapp/${targetUrl}`;
              }
            },
          }
        );
      } else {
        toast.modal(
          'No EVM wallet detected. Please install the MetaMask or Rabby browser extension.',
          'WALLET NOT DETECTED',
          { type: 'warning' }
        );
      }
      return;
    }
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts[0]) {
        setActiveWallet(accounts[0]);
        await addRobinhoodChainToWallet();
        toast.success('Wallet connected to Robinhood Chain!', 'CONNECTED');
      }
    } catch (err: any) {
      console.warn('Wallet connection request failed:', err);
      if (err?.code === 4001) {
        toast.info('Connection prompt was cancelled in wallet.', 'CANCELLED');
      } else {
        toast.error(err?.message || 'Connection failed.', 'WALLET ERROR');
      }
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('graven_disconnected', 'true');
    }
    setIsDisconnected(true);
    setActiveWallet(null);
    toast.info('Wallet disconnected.', 'DISCONNECTED');
  }, []);

  const signMessage = useCallback(
    async (params: { message: string } | string): Promise<string> => {
      const messageStr = typeof params === 'string' ? params : params.message;
      const ethereum = getInjectedProvider();
      if (ethereum) {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        const signerAddr = accounts?.[0] || activeWallet;
        if (signerAddr) {
          return await ethereum.request({
            method: 'personal_sign',
            params: [messageStr, signerAddr],
          });
        }
      }
      throw new Error('No connected wallet to sign message');
    },
    [activeWallet]
  );

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    return activeWallet || null;
  }, [activeWallet]);

  const connectDirectMetaMask = useCallback(async (): Promise<string | null> => {
    await login();
    return activeWallet;
  }, [login, activeWallet]);

  return (
    <AuthContext.Provider
      value={{
        ready,
        authenticated: Boolean(activeWallet),
        user: activeWallet ? { wallet: { address: activeWallet } } : null,
        wallets: activeWallet
          ? [
              {
                address: activeWallet,
                chainId: `eip155:${robinhoodChainId}`,
                switchChain: async () => {},
              },
            ]
          : [],
        activeWallet,
        login,
        connectWallet: login,
        logout,
        signMessage,
        getAccessToken,
        isMock: false,
        showHttpsNotice: false,
        setShowHttpsNotice: () => {},
        connectDirectMetaMask,
        addRobinhoodChain: addRobinhoodChainToWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Backward-compatible alias
export const MockLanAuthProvider = DirectInjectedAuthProvider;

// Unified custom hook used across all app components
export function useAuth() {
  return useContext(AuthContext);
}

// Backward-compatible hook drop-ins
export function usePrivy() {
  const auth = useAuth();
  return {
    ready: auth.ready,
    authenticated: auth.authenticated,
    user: auth.user,
    login: auth.login,
    connectWallet: auth.connectWallet || auth.login,
    logout: auth.logout,
    signMessage: auth.signMessage,
    getAccessToken: auth.getAccessToken,
  };
}

export function useWallets() {
  const auth = useAuth();
  return {
    ready: auth.ready,
    wallets: auth.wallets,
  };
}

