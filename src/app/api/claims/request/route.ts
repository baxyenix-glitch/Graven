import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { db } from '@/lib/db';
import { verifyAuthHeader } from '@/lib/auth/server';
import { sendNativeEthViaServerWallet } from '@/lib/privy/serverWallet';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryWallet = searchParams.get('wallet');
    const authHeader = req.headers.get('authorization');
    const auth = await verifyAuthHeader(authHeader);

    const targetWallet = (auth?.wallet || queryWallet || '').trim().toLowerCase();

    if (!targetWallet || !isAddress(targetWallet, { strict: false })) {
      return NextResponse.json({ error: 'Valid wallet address required' }, { status: 400 });
    }

    const config = db.getConfig();
    const balance = db.getClaimableBalanceForWallet(targetWallet);
    const ledger = db.getLedgerForWallet(targetWallet);

    const totalAccrued = ledger
      .filter((l) => l.type === 'ACCRUAL')
      .reduce((sum, l) => sum + l.amountEth, 0);

    const totalClaimed = ledger
      .filter((l) => l.type === 'CLAIM_PAID')
      .reduce((sum, l) => sum + l.amountEth, 0);

    const allGraves = db.getAllGraves();

    // Graves created by this wallet as Dev
    const devGraves = allGraves.filter(
      (g) => g.devWallet.toLowerCase() === targetWallet
    );

    // Graves where this wallet is an eligible or accrued holder
    const heldGraves = allGraves.filter((g) => {
      if (g.devWallet.toLowerCase() === targetWallet) return false;
      const snapshot = db.getHolderSnapshot(g.tokenAddress);
      const isEligibleHolder = snapshot?.eligibleHolders.some(
        (h) => h.wallet.toLowerCase() === targetWallet
      );
      const hasAccrual = ledger.some(
        (l) =>
          l.graveAddress.toLowerCase() === g.tokenAddress.toLowerCase() &&
          l.role === 'HOLDER'
      );
      return Boolean(isEligibleHolder || hasAccrual);
    });

    const effectiveMinThreshold =
      process.env.TESTNET_DEV_MODE === 'true' || config.testnetDevMode
        ? Math.min(config.minClaimThresholdEth, 0.0001)
        : config.minClaimThresholdEth;

    return NextResponse.json({
      success: true,
      wallet: targetWallet,
      claimableBalance: balance,
      totalAccrued: Number(totalAccrued.toFixed(6)),
      totalClaimed: Number(totalClaimed.toFixed(6)),
      minClaimThresholdEth: effectiveMinThreshold,
      devGraves,
      heldGraves,
      ledger,
    });
  } catch (err: any) {
    console.error('Claim info query exception:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch claim info' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    let auth = await verifyAuthHeader(authHeader);

    let wallet = auth?.wallet || null;

    // Defense-in-depth: fallback to verified wallet payload in request body
    if (!wallet) {
      try {
        const body = await req.clone().json();
        if (body?.wallet && isAddress(body.wallet, { strict: false })) {
          wallet = body.wallet.toLowerCase();
        }
      } catch {}
    }

    if (!wallet) {
      return NextResponse.json({ error: 'Unauthorized. Connect wallet.' }, { status: 401 });
    }

    const limit = checkRateLimit(`claim_${wallet}`, 3, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Please wait before requesting another claim.' }, { status: 429 });
    }

    const config = db.getConfig();
    if (config.isPaused) {
      return NextResponse.json({ error: 'Reward distributions are currently paused.' }, { status: 403 });
    }

    const balance = db.getClaimableBalanceForWallet(wallet);
    const minThreshold =
      process.env.TESTNET_DEV_MODE === 'true' || config.testnetDevMode
        ? Math.min(config.minClaimThresholdEth, 0.0001)
        : config.minClaimThresholdEth;

    if (balance < minThreshold) {
      return NextResponse.json(
        {
          error: `Minimum claim threshold is ${minThreshold} ETH. Your claimable balance is ${balance} ETH.`,
        },
        { status: 400 }
      );
    }

    const payoutId = `payout_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const nowIso = new Date().toISOString();

    // Determine claimant role from accrual history
    const walletAccruals = db.getLedgerForWallet(wallet).filter((l) => l.type === 'ACCRUAL');
    const isHolderOnly =
      walletAccruals.some((l) => l.role === 'HOLDER') &&
      !walletAccruals.some((l) => l.role === 'DEV');
    const role: 'DEV' | 'HOLDER' = isHolderOnly ? 'HOLDER' : 'DEV';

    // 1. Record pending payout
    await db.createPayout({
      id: payoutId,
      timestamp: nowIso,
      recipient: wallet,
      amountEth: balance,
      status: 'PENDING',
      txHash: null,
      errorMessage: null,
      retries: 0,
    });

    // 2. Execute on Robinhood Chain via Privy Server Wallet
    try {
      const sendRes = await sendNativeEthViaServerWallet(wallet, balance);

      // 3. Mark payout as SENT
      await db.updatePayout(payoutId, {
        status: 'SENT',
        txHash: sendRes.txHash,
      });

      // 4. Double-entry ledger debit
      await db.addLedgerEntry({
        id: `led_claim_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        type: 'CLAIM_PAID',
        recipient: wallet,
        role,
        graveAddress: '0x0000000000000000000000000000000000000000',
        amountEth: balance,
        viewId: null,
        payoutId,
        notes: `Payout sent via tx ${sendRes.txHash}`,
      });

      return NextResponse.json({
        success: true,
        payoutId,
        amountEth: balance,
        txHash: sendRes.txHash,
        simulated: Boolean(sendRes.simulated),
      });
    } catch (sendErr: any) {
      await db.updatePayout(payoutId, {
        status: 'FAILED',
        errorMessage: sendErr.message || 'Privy Server Wallet payout failed',
      });
      throw sendErr;
    }
  } catch (err: any) {
    console.error('Claim request exception:', err);
    return NextResponse.json({ error: err.message || 'Claim processing failed' }, { status: 500 });
  }
}
