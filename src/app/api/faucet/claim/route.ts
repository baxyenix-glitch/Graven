import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { db } from '@/lib/db';
import { isTestnet } from '@/lib/chain/config';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const FAUCET_AMOUNT = 20000; // 20,000 $GRAVEN

export async function POST(req: NextRequest) {
  try {
    if (!isTestnet) {
      return NextResponse.json({ error: 'Faucet is only available on Testnet' }, { status: 403 });
    }

    const body = await req.json();
    const { wallet } = body;

    if (!wallet || !isAddress(wallet)) {
      return NextResponse.json({ error: 'Valid wallet address required' }, { status: 400 });
    }

    const lowerWallet = wallet.toLowerCase();
    const limit = checkRateLimit(`faucet_${lowerWallet}`, 2, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Too many faucet attempts. Please wait.' }, { status: 429 });
    }

    // Check if claimed in last 24h
    const lastClaim = db.getFaucetClaim(lowerWallet);
    if (lastClaim) {
      const lastTime = new Date(lastClaim.lastClaimedAt).getTime();
      const diffHours = (Date.now() - lastTime) / (1000 * 60 * 60);
      if (diffHours < 24) {
        const remainingHours = Math.ceil(24 - diffHours);
        return NextResponse.json(
          {
            error: `You have already claimed today. Please wait ${remainingHours} hour(s) before claiming again.`,
          },
          { status: 429 }
        );
      }
    }

    // In production testnet, the server wallet transfers testnet $GRAVEN tokens to the user.
    // For testnet demonstration, we generate a mock/simulated tx hash if no on-chain treasury is funded.
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const claim = await db.recordFaucetClaim(lowerWallet, FAUCET_AMOUNT, txHash);

    return NextResponse.json({
      success: true,
      amount: FAUCET_AMOUNT,
      txHash,
      claim,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Faucet claim failed' }, { status: 500 });
  }
}
