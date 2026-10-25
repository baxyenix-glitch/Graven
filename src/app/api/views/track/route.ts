import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { HolderSnapshot } from '@/lib/db/schemas';
import { verifyAuthHeader } from '@/lib/auth/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { checkIsTokenHolderOnChain } from '@/lib/chain/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limit = checkRateLimit(`view_${ip}`, 60, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const { graveAddress, durationSeconds = 0 } = body;

    if (!graveAddress) {
      return NextResponse.json({ error: 'Grave address required' }, { status: 400 });
    }

    const lowerGrave = graveAddress.toLowerCase();
    const grave = db.getGraveByAddress(lowerGrave);
    if (!grave) {
      return NextResponse.json({ error: 'Grave not found' }, { status: 404 });
    }

    // Check authentication
    const authHeader = req.headers.get('authorization');
    const auth = await verifyAuthHeader(authHeader);
    const viewerWallet = auth?.wallet || null;

    let isQualified = false;
    let disqualificationReason: string | null = null;
    let rewardAssignedEth = 0;

    const config = db.getConfig();

    if (!viewerWallet) {
      disqualificationReason = 'wallet_not_connected';
    } else if (durationSeconds < 5) {
      disqualificationReason = 'duration_under_5s';
    } else if (db.hasWalletViewedIn24h(lowerGrave, viewerWallet)) {
      disqualificationReason = 'already_viewed_in_24h';
    } else {
      // Check holder snapshot
      const snapshot = db.getHolderSnapshot(lowerGrave);
      const isDev = grave.devWallet.toLowerCase() === viewerWallet.toLowerCase();
      let eligibleHolder = snapshot?.eligibleHolders.find(
        (h) => h.wallet.toLowerCase() === viewerWallet.toLowerCase()
      );
      const isExcluded = snapshot?.excludedHolders.some(
        (h) => h.wallet.toLowerCase() === viewerWallet.toLowerCase()
      );

      // SOLUTION 1: Automatic Live On-Chain Verification
      // If the visiting wallet is not the dev and not yet in the static snapshot,
      // verify their token balance or transfer history on Robinhood Chain directly.
      if (!isDev && !eligibleHolder && !isExcluded) {
        try {
          const onChainCheck = await checkIsTokenHolderOnChain(lowerGrave, viewerWallet);
          if (onChainCheck.isHolder) {
            // Automatically add to the token's snapshot so it is permanently cached and credited
            const currentSnap: HolderSnapshot = snapshot
              ? { ...snapshot, eligibleHolders: [...snapshot.eligibleHolders] }
              : {
                  tokenAddress: lowerGrave,
                  snapshotTakenAt: new Date().toISOString(),
                  totalOriginalHolders: 0,
                  eligibleHolders: [],
                  excludedHolders: [],
                };

            const newHolderEntry = {
              wallet: viewerWallet.toLowerCase(),
              firstBuyTime: new Date().toISOString(),
              firstBuyTx: `0x${'0'.repeat(64)}`,
              amountBought: onChainCheck.currentBalance.toString(),
              amountSold: '0',
              averageEntryEth: 0,
              totalInvestedEth: 0,
              currentBalance: onChainCheck.currentBalance.toString(),
              pnlEth: 0,
              snapshotRank: currentSnap.eligibleHolders.length + 1,
            };

            currentSnap.eligibleHolders.push(newHolderEntry);
            currentSnap.totalOriginalHolders = currentSnap.eligibleHolders.length;
            await db.saveHolderSnapshot(currentSnap);
            eligibleHolder = newHolderEntry;
            console.log(
              `[ON-CHAIN AUTO-SNAPSHOT] Automatically verified and added on-chain holder ${viewerWallet} (source: ${onChainCheck.source}) for token ${lowerGrave}`
            );
          }
        } catch (chainErr) {
          console.warn('[ON-CHAIN VERIFY ERROR]', chainErr);
        }
      }

      if (isExcluded) {
        disqualificationReason = 'excluded_by_anti_sybil';
      } else if (!isDev && !eligibleHolder) {
        disqualificationReason = 'not_original_holder';
      } else if (config.isPaused) {
        disqualificationReason = 'rewards_paused';
      } else {
        // Qualified!
        isQualified = true;
        const totalReward = config.rewardEthPerQualifiedView;
        rewardAssignedEth = totalReward;

        const devAmount = (totalReward * config.rewardDevPct) / 100;
        const holderAmount = (totalReward * config.rewardHoldersPct) / 100;
        const platformAmount = (totalReward * config.rewardPlatformPct) / 100;

        const nowIso = new Date().toISOString();
        const viewId = `view_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

        // Double-entry ledger accruals
        // 1. Dev reward
        await db.addLedgerEntry({
          id: `led_dev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: nowIso,
          type: 'ACCRUAL',
          recipient: grave.devWallet,
          role: 'DEV',
          graveAddress: lowerGrave,
          amountEth: devAmount,
          viewId,
          payoutId: null,
          notes: '60% dev reward from qualified view',
        });

        // 2. Viewer / holder reward
        if (!isDev) {
          await db.addLedgerEntry({
            id: `led_hld_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            timestamp: nowIso,
            type: 'ACCRUAL',
            recipient: viewerWallet,
            role: 'HOLDER',
            graveAddress: lowerGrave,
            amountEth: holderAmount,
            viewId,
            payoutId: null,
            notes: '30% original holder visit reward',
          });
        }

        // 3. Platform reward
        const treasury = (process.env.NEXT_PUBLIC_PRIVY_SERVER_WALLET_ADDRESS || '0x000000000000000000000000000000000000dEaD').toLowerCase();
        await db.addLedgerEntry({
          id: `led_plt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: nowIso,
          type: 'ACCRUAL',
          recipient: treasury,
          role: 'PLATFORM',
          graveAddress: lowerGrave,
          amountEth: platformAmount,
          viewId,
          payoutId: null,
          notes: '10% protocol maintenance fee',
        });
      }
    }

    // Record view in DB
    const viewRecord = await db.recordView({
      id: `view_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      graveAddress: lowerGrave,
      viewerWallet,
      timestamp: new Date().toISOString(),
      isQualified,
      disqualificationReason,
      durationSeconds,
      rewardAssignedEth,
    });

    return NextResponse.json({
      success: true,
      view: viewRecord,
    });
  } catch (err: any) {
    console.error('View tracking error:', err);
    return NextResponse.json({ error: err.message || 'Tracking failed' }, { status: 500 });
  }
}
