import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { z } from 'zod';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { verifySignature, checkGravenBalance } from '@/lib/chain/client';
import { resolveToken } from '@/lib/launchpads';
import { GraveRecord } from '@/lib/db/schemas';

export const dynamic = 'force-dynamic';

const VerifySchema = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  epitaph: z.string().min(1).max(140),
  signature: z.string().min(10),
  message: z.string().min(10),
  nonce: z.string().min(5),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limit = checkRateLimit(`verify_${ip}`, 10, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Rate limit reached. Please wait.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = VerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid burial submission', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { wallet, tokenAddress, epitaph, signature, message, nonce } = parsed.data;
    const lowerWallet = wallet.toLowerCase();
    const lowerToken = tokenAddress.toLowerCase();

    // 1. Epitaph checks (URL check, sanitization)
    if (/https?:\/\/|www\./i.test(epitaph) || /\.com|\.xyz|\.io|\.org/i.test(epitaph)) {
      return NextResponse.json(
        { error: 'Epitaphs cannot contain URLs or web domains.' },
        { status: 400 }
      );
    }
    const cleanEpitaph = epitaph.trim();

    // 2. Consume single-use nonce
    const nonceValid = await db.consumeNonce(nonce, lowerWallet, lowerToken);
    if (!nonceValid) {
      return NextResponse.json(
        { error: 'Invalid, expired, or already-used signing session. Please refresh and re-sign.' },
        { status: 400 }
      );
    }

    // 3. Verify signature
    const isValidSig = await verifySignature(message, signature, lowerWallet);
    if (!isValidSig) {
      return NextResponse.json(
        { error: 'Cryptographic signature verification failed.' },
        { status: 400 }
      );
    }

    // 5. Strict 10,000 $GRAVEN requirement
    const holdStatus = await checkGravenBalance(lowerWallet);
    if (!holdStatus.hasEnough) {
      return NextResponse.json(
        {
          error: `Insufficient $GRAVEN tokens. Wallet holds ${holdStatus.balance.toLocaleString()} $GRAVEN, but at least 10,000 $GRAVEN is required.`,
        },
        { status: 403 }
      );
    }

    // 6. On-chain Creator check (with testnet / dev mode sponsor override)
    const tokenDetails = await resolveToken(lowerToken);
    const isDirectCreator = tokenDetails.creator.toLowerCase() === lowerWallet;
    const testnetDevMode = process.env.TESTNET_DEV_MODE !== 'false';
    const adminWallets = (process.env.ADMIN_WALLETS || '')
      .toLowerCase()
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean);
    const isAdmin = adminWallets.includes(lowerWallet);
    const isZeroCreator = tokenDetails.creator === '0x0000000000000000000000000000000000000000';

    const canBury = isDirectCreator || testnetDevMode || isAdmin || isZeroCreator;

    if (!canBury) {
      return NextResponse.json(
        {
          error: `Creator mismatch. This token was launched by ${tokenDetails.creator}. Only the verified creator wallet can bury it.`,
        },
        { status: 403 }
      );
    }

    // 7. Prevent duplicate burial
    if (db.getGraveByAddress(lowerToken)) {
      return NextResponse.json({ error: 'This token is already buried.' }, { status: 400 });
    }

    // 8. Create Grave Record
    const nowIso = new Date().toISOString();
    const createdDate = tokenDetails.createdAt || nowIso;
    const daysLived = Math.max(
      1,
      Math.floor((new Date(nowIso).getTime() - new Date(createdDate).getTime()) / (1000 * 60 * 60 * 24))
    );

    const graveRecord: GraveRecord = {
      id: lowerToken,
      tokenAddress: lowerToken,
      name: tokenDetails.name,
      symbol: tokenDetails.symbol,
      decimals: tokenDetails.decimals,
      logoUrl: tokenDetails.logoUrl || '',
      devWallet: lowerWallet,
      launchpad: tokenDetails.launchpad,
      birthDate: createdDate,
      deathDate: nowIso,
      daysLived,
      peakMcapEth: tokenDetails.peakMcapEth || 0,
      epitaph: cleanEpitaph,
      signature,
      signedMessage: message,
      buriedAt: nowIso,
      buriedBlock: 0,
      viewsCount: 0,
      qualifiedViewsCount: 0,
      totalEthEarned: 0,
      totalEthClaimed: 0,
      isRisen: tokenDetails.isRisen,
      risenAt: tokenDetails.risenDate,
      status: 'live',
    };

    await db.createGrave(graveRecord);

    // Upsert token in db
    await db.upsertToken({
      address: lowerToken,
      name: tokenDetails.name,
      symbol: tokenDetails.symbol,
      decimals: tokenDetails.decimals,
      logoUrl: tokenDetails.logoUrl,
      creator: lowerWallet,
      launchpad: tokenDetails.launchpad,
      createdAt: createdDate,
      peakMcapEth: tokenDetails.peakMcapEth,
      peakMcapDate: tokenDetails.peakMcapDate,
      deathMcapEth: tokenDetails.deathMcapEth,
      deathDate: nowIso,
      initialLiquidityEth: tokenDetails.initialLiquidityEth,
      isBuried: true,
      bondingCurveProgress: tokenDetails.bondingCurveProgress,
      isRisen: tokenDetails.isRisen,
      risenDate: tokenDetails.risenDate,
    });

    // Initialize initial holder snapshot
    await db.saveHolderSnapshot({
      tokenAddress: lowerToken,
      snapshotTakenAt: nowIso,
      totalOriginalHolders: 1,
      eligibleHolders: [
        {
          wallet: lowerWallet,
          firstBuyTime: createdDate,
          firstBuyTx: `0x${'0'.repeat(64)}`,
          amountBought: '1000000000',
          amountSold: '0',
          averageEntryEth: 0.0001,
          totalInvestedEth: 0.1,
          currentBalance: '1000000000',
          pnlEth: -0.1,
          snapshotRank: 1,
        },
      ],
      excludedHolders: [],
    });

    return NextResponse.json({
      success: true,
      grave: graveRecord,
    });
  } catch (err: any) {
    console.error('Bury verify error:', err);
    return NextResponse.json({ error: err.message || 'Burial failed' }, { status: 500 });
  }
}
