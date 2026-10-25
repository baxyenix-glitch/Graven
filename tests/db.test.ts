import { describe, it, expect } from 'vitest';
import { db } from '../src/lib/db';

describe('JSON Database Engine', () => {
  it('loads default config properly', () => {
    const config = db.getConfig();
    expect(config.rewardDevPct).toBe(60);
    expect(config.rewardHoldersPct).toBe(30);
    expect(config.rewardPlatformPct).toBe(10);
    expect(config.minGravenHold).toBe(10000);
  });

  it('generates and consumes single-use nonces', async () => {
    const wallet = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const token = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const nonceRecord = await db.createNonce(wallet, token);
    expect(nonceRecord.nonce).toBeDefined();
    expect(nonceRecord.used).toBe(false);

    // Consume with wrong wallet fails
    const failConsume = await db.consumeNonce(nonceRecord.nonce, '0x9999999999999999999999999999999999999999', token);
    expect(failConsume).toBe(false);

    // Consume with correct params succeeds
    const successConsume = await db.consumeNonce(nonceRecord.nonce, wallet, token);
    expect(successConsume).toBe(true);

    // Replay attack fails
    const replayConsume = await db.consumeNonce(nonceRecord.nonce, wallet, token);
    expect(replayConsume).toBe(false);
  });

  it('accurately maintains double-entry ledger and claimable balance', async () => {
    const userWallet = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const graveAddr = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    // Accrue 0.05 ETH
    await db.addLedgerEntry({
      id: `acc_test_${Date.now()}_1`,
      timestamp: new Date().toISOString(),
      type: 'ACCRUAL',
      recipient: userWallet,
      role: 'DEV',
      graveAddress: graveAddr,
      amountEth: 0.05,
      viewId: null,
      payoutId: null,
      notes: 'Test dev reward',
    });

    // Check balance
    let balance = db.getClaimableBalanceForWallet(userWallet);
    expect(balance).toBe(0.05);

    // Record payout of 0.02 ETH
    await db.addLedgerEntry({
      id: `pay_test_${Date.now()}_2`,
      timestamp: new Date().toISOString(),
      type: 'CLAIM_PAID',
      recipient: userWallet,
      role: 'DEV',
      graveAddress: graveAddr,
      amountEth: 0.02,
      viewId: null,
      payoutId: 'payout_1',
      notes: 'Claim paid',
    });

    balance = db.getClaimableBalanceForWallet(userWallet);
    expect(balance).toBe(0.03);
  });
});
