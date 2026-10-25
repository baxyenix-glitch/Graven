import { defineChain, type Chain } from 'viem';

export const isTestnet = process.env.NEXT_PUBLIC_NETWORK_MODE === 'testnet';

// Robinhood Chain Testnet (Chain ID 46630)
export const robinhoodTestnet: Chain = defineChain({
  id: 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.chain.robinhood.com'],
    },
    public: {
      http: ['https://rpc.testnet.chain.robinhood.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Robinhood Chain Explorer',
      url: 'https://explorer.testnet.chain.robinhood.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
  testnet: true,
});

// Robinhood Chain Mainnet (Chain ID 4663)
export const robinhoodMainnetRpcUrls = [
  process.env.NEXT_PUBLIC_RH_MAINNET_RPC_URL || 'https://rpc.mainnet.chain.robinhood.com',
  'https://robinhood-rpc.publicnode.com',
];

export const robinhoodTestnetRpcUrls = [
  process.env.NEXT_PUBLIC_RH_TESTNET_RPC_URL || 'https://rpc.testnet.chain.robinhood.com',
];

export const robinhoodMainnet: Chain = defineChain({
  id: Number(process.env.NEXT_PUBLIC_RH_MAINNET_CHAIN_ID || 4663),
  name: 'Robinhood Chain Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: robinhoodMainnetRpcUrls,
    },
    public: {
      http: robinhoodMainnetRpcUrls,
    },
  },
  blockExplorers: {
    default: {
      name: 'Robinhood Chain Explorer',
      url: process.env.NEXT_PUBLIC_RH_MAINNET_EXPLORER_URL || 'https://robinhoodchain.blockscout.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
  testnet: false,
});

// Active Chain: Robinhood Chain Mainnet (Chain ID 4663)
export const robinhoodChain: Chain = isTestnet ? robinhoodTestnet : robinhoodMainnet;
export const robinhoodChainId = robinhoodChain.id;
export const robinhoodRpcUrl = robinhoodChain.rpcUrls.default.http[0];
export const robinhoodExplorerUrl =
  robinhoodChain.blockExplorers?.default.url || 'https://robinhoodchain.blockscout.com';
export const robinhoodExplorerApiUrl = `${robinhoodExplorerUrl}/api`;
export const robinhoodMainnetExplorerApiUrl = 'https://robinhoodchain.blockscout.com/api';
export const robinhoodTestnetExplorerApiUrl = 'https://explorer.testnet.chain.robinhood.com/api';

export const gravenTokenAddress = (
  process.env.NEXT_PUBLIC_GRAVEN_TOKEN_ADDRESS ||
  process.env.GRAVEN_TOKEN_ADDRESS ||
  ''
).toLowerCase();

export const minGravenHold = Number(process.env.MIN_GRAVEN_HOLD || 10000);
