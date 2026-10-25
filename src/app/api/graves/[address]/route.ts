import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAddress } from 'viem';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: 'Invalid token address format' }, { status: 400 });
    }

    const grave = db.getGraveByAddress(address);
    if (!grave) {
      return NextResponse.json({ error: 'Grave not found' }, { status: 404 });
    }

    const token = db.getToken(address);
    const snapshot = db.getHolderSnapshot(address);

    return NextResponse.json({
      grave,
      token,
      snapshotSummary: snapshot
        ? {
            totalOriginalHolders: snapshot.totalOriginalHolders,
            eligibleHoldersCount: snapshot.eligibleHolders.length,
            excludedHoldersCount: snapshot.excludedHolders.length,
          }
        : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to retrieve grave' }, { status: 500 });
  }
}
