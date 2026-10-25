import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { checkGravenBalance } from '@/lib/chain/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet')?.trim();

    if (!wallet || !isAddress(wallet, { strict: false })) {
      return NextResponse.json({ error: 'Valid wallet address required' }, { status: 400 });
    }

    const status = await checkGravenBalance(wallet);
    return NextResponse.json(status);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Balance check failed' }, { status: 500 });
  }
}
