import { LaunchpadAdapter, TokenLaunchDetails } from './types';
import { readTokenMetadata, getTokenOwnerOnChain } from '../chain/client';
import {
  robinhoodExplorerApiUrl,
  robinhoodMainnetExplorerApiUrl,
  robinhoodTestnetExplorerApiUrl,
} from '../chain/config';

export class GenericAdapter implements LaunchpadAdapter {
  id = 'other' as const;
  name = 'Generic ERC-20';

  async detect(_tokenAddress: string): Promise<boolean> {
    return true; // Generic adapter acts as universal fallback
  }

  async getCreatorFromExplorer(
    tokenAddress: string,
    preferredNetwork?: 'mainnet' | 'testnet'
  ): Promise<{ creator: string | null; txHash: string | null }> {
    const apiEndpoints =
      preferredNetwork === 'mainnet'
        ? [robinhoodMainnetExplorerApiUrl, robinhoodTestnetExplorerApiUrl]
        : preferredNetwork === 'testnet'
        ? [robinhoodTestnetExplorerApiUrl, robinhoodMainnetExplorerApiUrl]
        : [robinhoodExplorerApiUrl, robinhoodMainnetExplorerApiUrl, robinhoodTestnetExplorerApiUrl];

    for (const endpoint of apiEndpoints) {
      try {
        const url = `${endpoint}?module=contract&action=getcontractcreation&contractaddresses=${tokenAddress}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(1800) });
        if (res.ok) {
          const data = await res.json();
          if (data.status === '1' && data.result && data.result.length > 0) {
            const item = data.result[0];
            if (item.contractCreator) {
              return {
                creator: item.contractCreator.toLowerCase(),
                txHash: item.txHash || null,
              };
            }
          }
        }
      } catch {}
    }
    return { creator: null, txHash: null };
  }

  async getDetails(tokenAddress: string, preloadedMeta?: any): Promise<TokenLaunchDetails> {
    const meta = preloadedMeta || (await readTokenMetadata(tokenAddress));

    let resolvedCreator = meta.creator;
    if (resolvedCreator === '0x0000000000000000000000000000000000000000') {
      const creation = await this.getCreatorFromExplorer(tokenAddress, meta.network);
      if (creation.creator) {
        resolvedCreator = creation.creator.toLowerCase();
      }
    }

    return {
      address: tokenAddress.toLowerCase(),
      name: meta.name,
      symbol: meta.symbol,
      decimals: meta.decimals,
      logoUrl: meta.logoUrl || '',
      creator: resolvedCreator,
      launchpad: 'other',
      createdAt: new Date().toISOString(),
      peakMcapEth: 0,
      peakMcapDate: new Date().toISOString(),
      deathMcapEth: 0,
      deathDate: new Date().toISOString(),
      initialLiquidityEth: 0,
      bondingCurveProgress: 0,
      isRisen: false,
      risenDate: null,
      adapterStatus: 'verified',
      network: meta.network,
      description: meta.description,
    };
  }
}

