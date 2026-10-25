import { describe, it, expect } from 'vitest';
import { db } from '../src/lib/db';
import { checkRateLimit } from '../src/lib/rate-limit';

describe('Protocol Business Logic & Integrity', () => {
  it('enforces 60/30/10 reward split math correctly', () => {
    const config = db.getConfig();
    const totalReward = config.rewardEthPerQualifiedView; // 0.0005

    const devAmount = (totalReward * config.rewardDevPct) / 100;
    const holdersAmount = (totalReward * config.rewardHoldersPct) / 100;
    const platformAmount = (totalReward * config.rewardPlatformPct) / 100;

    expect(config.rewardDevPct).toBe(60);
    expect(config.rewardHoldersPct).toBe(30);
    expect(config.rewardPlatformPct).toBe(10);

    expect(devAmount + holdersAmount + platformAmount).toBeCloseTo(totalReward, 6);
    expect(devAmount).toBeCloseTo(0.0003, 6);
    expect(holdersAmount).toBeCloseTo(0.00015, 6);
    expect(platformAmount).toBeCloseTo(0.00005, 6);
  });

  it('correctly tracks and rate limits requests', () => {
    const key = `test_ratelimit_${Date.now()}`;
    const res1 = checkRateLimit(key, 3, 10000);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit(key, 3, 10000);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = checkRateLimit(key, 3, 10000);
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);

    const res4 = checkRateLimit(key, 3, 10000);
    expect(res4.allowed).toBe(false);
    expect(res4.remaining).toBe(0);
  });

  it('verifies holder snapshot storage and anti-sybil exclusion lists', async () => {
    const token = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const honestHolder = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const sybilWallet = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    await db.saveHolderSnapshot({
      tokenAddress: token,
      snapshotTakenAt: new Date().toISOString(),
      totalOriginalHolders: 2,
      eligibleHolders: [
        {
          wallet: honestHolder,
          firstBuyTime: '2026-03-01T00:00:00Z',
          firstBuyTx: '0x123',
          amountBought: '50000',
          amountSold: '0',
          averageEntryEth: 0.00002,
          totalInvestedEth: 1.0,
          currentBalance: '50000',
          pnlEth: -1.0,
          snapshotRank: 1,
        },
      ],
      excludedHolders: [
        {
          wallet: sybilWallet,
          reason: 'Funded directly by dev wallet within 2 hops',
        },
      ],
    });

    const retrieved = db.getHolderSnapshot(token);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.eligibleHolders.length).toBe(1);
    expect(retrieved?.eligibleHolders[0].wallet).toBe(honestHolder);
    expect(retrieved?.excludedHolders.length).toBe(1);
    expect(retrieved?.excludedHolders[0].reason).toContain('dev wallet');
  });

  it('verifies 24-hour qualified view restriction', async () => {
    const graveAddress = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const viewerWallet = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    // Initial state: not viewed in 24h
    expect(db.hasWalletViewedIn24h(graveAddress, viewerWallet)).toBe(false);

    // Record a qualified view
    await db.recordView({
      id: `view_test_${Date.now()}`,
      graveAddress,
      viewerWallet,
      timestamp: new Date().toISOString(),
      isQualified: true,
      disqualificationReason: null,
      durationSeconds: 10,
      rewardAssignedEth: 0.0005,
    });

    // Second check within 24h: must return true
    expect(db.hasWalletViewedIn24h(graveAddress, viewerWallet)).toBe(true);
  });

  it('creates daily backup directory and recalculates cached stats', async () => {
    const { createDailyBackup, persistStatsCache } = await import('../src/lib/db');
    await persistStatsCache();
    await createDailyBackup();

    const stats = db.getStats();
    expect(stats).toBeDefined();
    expect(typeof stats.tokensBuried).toBe('number');
    expect(typeof stats.totalGraveViews).toBe('number');
    expect(typeof stats.ethPaidOut).toBe('number');
  });
});

