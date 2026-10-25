import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { robinhoodChainId } from '@/lib/chain/config';
import { checkGravenBalance } from '@/lib/chain/client';
import { resolveToken } from '@/lib/launchpads';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limit = checkRateLimit(`nonce_${ip}`, 20, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again soon.' }, { status: 429 });
    }

    const body = await req.json();
    const { wallet, tokenAddress } = body;

    if (!wallet || !isAddress(wallet)) {
      return NextResponse.json({ error: 'Valid wallet address required' }, { status: 400 });
    }

    if (!tokenAddress || !isAddress(tokenAddress)) {
      return NextResponse.json({ error: 'Valid token address required' }, { status: 400 });
    }

    const lowerWallet = wallet.toLowerCase();
    const lowerToken = tokenAddress.toLowerCase();

    // Check if already buried
    if (db.getGraveByAddress(lowerToken)) {
      return NextResponse.json({ error: 'This token is already buried in Graven.' }, { status: 400 });
    }

    // 1. Strict 10,000 $GRAVEN requirement
    const holdStatus = await checkGravenBalance(lowerWallet);
    if (!holdStatus.hasEnough) {
      return NextResponse.json(
        {
          error: `Insufficient $GRAVEN tokens. Wallet holds ${holdStatus.balance.toLocaleString()} $GRAVEN, but at least 10,000 $GRAVEN is required.`,
        },
        { status: 403 }
      );
    }

    // 2. Strict Creator check
    const tokenDetails = await resolveToken(lowerToken);
    if (tokenDetails.creator.toLowerCase() !== lowerWallet) {
      return NextResponse.json(
        {
          error: `Creator mismatch. Only the verified on-chain creator (${tokenDetails.creator}) can bury this token.`,
        },
        { status: 403 }
      );
    }

    const nonceRecord = await db.createNonce(lowerWallet, lowerToken);

    const message = [
      'Graven Protocol - Token Burial Attestation',
      '----------------------------------------',
      `Chain ID: ${robinhoodChainId}`,
      `Token Address: ${lowerToken}`,
      `Creator Wallet: ${lowerWallet}`,
      `Nonce: ${nonceRecord.nonce}`,
      `Issued At: ${new Date().toISOString()}`,
      `Expires In: 10 minutes`,
      '',
      'By signing, you confirm that you are the creator of this token and wish to lay it to rest under Graven Protocol.',
    ].join('\n');

    return NextResponse.json({
      nonce: nonceRecord.nonce,
      message,
      expiresAt: nonceRecord.expiresAt,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to issue nonce' }, { status: 500 });
  }
}
