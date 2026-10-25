export interface TokenLaunchDetails {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoUrl: string;
  creator: string;
  launchpad: 'pons' | 'other';
  createdAt: string;
  peakMcapEth: number;
  peakMcapDate: string;
  deathMcapEth: number;
  deathDate: string;
  initialLiquidityEth: number;
  bondingCurveProgress: number;
  isRisen: boolean;
  risenDate: string | null;
  adapterStatus?: 'verified' | 'needs config';
  network?: 'mainnet' | 'testnet';
  description?: string | null;
}

export interface LaunchpadAdapter {
  id: 'pons' | 'other';
  name: string;
  detect(tokenAddress: string): Promise<boolean>;
  getDetails(tokenAddress: string): Promise<TokenLaunchDetails>;
}
