import { z } from 'zod';

export const ConfigSchema = z.object({
  version: z.number().default(1),
  rewardDevPct: z.number().default(60),
  rewardHoldersPct: z.number().default(30),
  rewardPlatformPct: z.number().default(10),
  rewardEthPerQualifiedView: z.number().default(0.0005),
  dailyCapPerWalletEth: z.number().default(0.05),
  dailyCapPerGraveEth: z.number().default(0.25),
  dailyCapGlobalEth: z.number().default(2.0),
  minClaimThresholdEth: z.number().default(0.001),
  minGravenHold: z.number().default(10000),
  deadMinDays: z.number().default(7),
  deadMcapDropPct: z.number().default(85),
  isPaused: z.boolean().default(false),
  testnetDevMode: z.boolean().default(true),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export type Config = z.infer<typeof ConfigSchema>;

export const TokenRecordSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number().default(18),
  logoUrl: z.string().default('/assets/logo.png'),
  creator: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  launchpad: z.enum(['pons', 'other']),
  createdAt: z.string(),
  peakMcapEth: z.number().default(0),
  peakMcapDate: z.string(),
  deathMcapEth: z.number().default(0),
  deathDate: z.string(),
  initialLiquidityEth: z.number().default(0),
  isBuried: z.boolean().default(false),
  bondingCurveProgress: z.number().default(0),
  isRisen: z.boolean().default(false),
  risenDate: z.string().nullable().default(null),
});

export type TokenRecord = z.infer<typeof TokenRecordSchema>;

export const GraveRecordSchema = z.object({
  id: z.string(),
  tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number().default(18),
  logoUrl: z.string().default('/assets/logo.png'),
  devWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  launchpad: z.enum(['pons', 'other']),
  birthDate: z.string(),
  deathDate: z.string(),
  daysLived: z.number().default(1),
  peakMcapEth: z.number().default(0),
  epitaph: z.string().max(140),
  signature: z.string(),
  signedMessage: z.string(),
  buriedAt: z.string(),
  buriedBlock: z.number().default(0),
  viewsCount: z.number().default(0),
  qualifiedViewsCount: z.number().default(0),
  totalEthEarned: z.number().default(0),
  totalEthClaimed: z.number().default(0),
  isRisen: z.boolean().default(false),
  risenAt: z.string().nullable().default(null),
  status: z.enum(['live', 'banned']).default('live'),
});

export type GraveRecord = z.infer<typeof GraveRecordSchema>;

export const HolderItemSchema = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  firstBuyTime: z.string(),
  firstBuyTx: z.string(),
  amountBought: z.string(),
  amountSold: z.string(),
  averageEntryEth: z.number(),
  totalInvestedEth: z.number(),
  currentBalance: z.string(),
  pnlEth: z.number(),
  snapshotRank: z.number(),
});

export const HolderSnapshotSchema = z.object({
  tokenAddress: z.string(),
  snapshotTakenAt: z.string(),
  totalOriginalHolders: z.number(),
  eligibleHolders: z.array(HolderItemSchema),
  excludedHolders: z.array(
    z.object({
      wallet: z.string(),
      reason: z.string(),
    })
  ),
});

export type HolderSnapshot = z.infer<typeof HolderSnapshotSchema>;

export const ViewRecordSchema = z.object({
  id: z.string(),
  graveAddress: z.string(),
  viewerWallet: z.string().nullable().default(null),
  timestamp: z.string(),
  isQualified: z.boolean().default(false),
  disqualificationReason: z.string().nullable().default(null),
  durationSeconds: z.number().default(0),
  rewardAssignedEth: z.number().default(0),
});

export type ViewRecord = z.infer<typeof ViewRecordSchema>;

export const LedgerEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  type: z.enum(['ACCRUAL', 'CLAIM_PAID', 'REVERSAL']),
  recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  role: z.enum(['DEV', 'HOLDER', 'PLATFORM']),
  graveAddress: z.string(),
  amountEth: z.number(),
  viewId: z.string().nullable().default(null),
  payoutId: z.string().nullable().default(null),
  notes: z.string().default(''),
});

export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;

export const PayoutRecordSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  amountEth: z.number(),
  status: z.enum(['PENDING', 'SENT', 'FAILED', 'RETRY']),
  txHash: z.string().nullable().default(null),
  errorMessage: z.string().nullable().default(null),
  retries: z.number().default(0),
});

export type PayoutRecord = z.infer<typeof PayoutRecordSchema>;

export const NonceRecordSchema = z.object({
  nonce: z.string(),
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  expiresAt: z.number(),
  used: z.boolean().default(false),
});

export type NonceRecord = z.infer<typeof NonceRecordSchema>;

export const UserRecordSchema = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  firstSeenAt: z.string(),
  lastActiveAt: z.string(),
  isBanned: z.boolean().default(false),
  role: z.enum(['user', 'admin']).default('user'),
  totalEarnedEth: z.number().default(0),
  totalClaimedEth: z.number().default(0),
});

export type UserRecord = z.infer<typeof UserRecordSchema>;

export const StatsCacheSchema = z.object({
  tokensBuried: z.number().default(0),
  totalGraveViews: z.number().default(0),
  ethPaidOut: z.number().default(0),
  holdersRewarded: z.number().default(0),
  buriedToday: z.number().default(0),
  activeGraves: z.number().default(0),
  recentEvents: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['BURIED', 'CLAIM_PAID']),
      tokenSymbol: z.string(),
      tokenAddress: z.string(),
      amountEth: z.number().optional(),
      timestamp: z.string(),
      description: z.string(),
    })
  ).default([]),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export type StatsCache = z.infer<typeof StatsCacheSchema>;

export const FaucetClaimSchema = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  lastClaimedAt: z.string(),
  amountClaimed: z.number(),
  txHash: z.string().nullable().default(null),
});

export type FaucetClaim = z.infer<typeof FaucetClaimSchema>;

export const AdminActionSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  adminWallet: z.string(),
  action: z.string(),
  target: z.string(),
  details: z.record(z.any()),
});

export type AdminAction = z.infer<typeof AdminActionSchema>;

export const FlaggedClusterSchema = z.object({
  id: z.string(),
  clusterName: z.string(),
  wallets: z.array(z.string()),
  reason: z.string(),
  flaggedAt: z.string(),
});

export type FlaggedCluster = z.infer<typeof FlaggedClusterSchema>;
