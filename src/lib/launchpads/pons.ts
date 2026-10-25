import { LaunchpadAdapter, TokenLaunchDetails } from './types';
import { readTokenMetadata, detectTokenNetwork, COMPREHENSIVE_TOKEN_ABI } from '../chain/client';
import { isAddress, getAddress } from 'viem';

export class PonsAdapter implements LaunchpadAdapter {
  id = 'pons' as const;
  name = 'Pons (pons.family)';

  private factoryAddress = process.env.PONS_FACTORY_ADDRESS?.toLowerCase();
  private routerAddress = process.env.PONS_BONDING_CURVE_ROUTER?.toLowerCase();
  private metadataApi = process.env.PONS_METADATA_API_URL || 'https://api.pons.family';

  get isConfigured(): boolean {
    return true; // Configured for on-chain contract inspection + API
  }

  async detect(tokenAddress: string): Promise<boolean> {
    if (!tokenAddress || !isAddress(tokenAddress, { strict: false })) return false;

    try {
      const addr = getAddress(tokenAddress);
      const { client, hasCode } = await detectTokenNetwork(addr);
      if (!hasCode) return false;

      // 1. Pons token contracts implement deployer() and logo() on-chain
      try {
        const deployer = await client.readContract({
          address: addr,
          abi: COMPREHENSIVE_TOKEN_ABI,
          functionName: 'deployer',
        });
        if (deployer && typeof deployer === 'string' && deployer !== '0x0000000000000000000000000000000000000000') {
          return true;
        }
      } catch {}

      // 2. Query Pons metadata API if available
      try {
        const res = await fetch(`${this.metadataApi}/token/${tokenAddress}`, {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && (data.isPons || data.name || data.creator)) {
            return true;
          }
        }
      } catch {}
    } catch {
      // Fallback
    }

    return false;
  }

  async getDetails(tokenAddress: string, preloadedMeta?: any): Promise<TokenLaunchDetails> {
    const meta = preloadedMeta || (await readTokenMetadata(tokenAddress));

    const resolvedCreator = (
      meta.creator ||
      '0x0000000000000000000000000000000000000000'
    ).toLowerCase();

    const resolvedLogo =
      meta.logoUrl && meta.logoUrl !== '/assets/logo.png' ? meta.logoUrl : '';

    return {
      address: tokenAddress.toLowerCase(),
      name: meta.name,
      symbol: meta.symbol,
      decimals: meta.decimals,
      logoUrl: resolvedLogo,
      creator: resolvedCreator,
      launchpad: 'pons',
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

