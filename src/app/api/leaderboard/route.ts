import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const graves = db.getAllGraves();
    const ledger = db.getLedgerForWallet(''); // Or query all ledger entries from memory

    // 1. Top Graves by qualified views
    const topGraves = [...graves]
      .sort((a, b) => b.qualifiedViewsCount - a.qualifiedViewsCount || b.viewsCount - a.viewsCount)
      .slice(0, 20);

    // 2. Top Devs by total ETH earned
    const devMap = new Map<string, { wallet: string; totalEth: number; gravesCount: number }>();
    for (const g of graves) {
      const dev = g.devWallet.toLowerCase();
      const existing = devMap.get(dev) || { wallet: dev, totalEth: 0, gravesCount: 0 };
      existing.totalEth += g.totalEthEarned;
      existing.gravesCount += 1;
      devMap.set(dev, existing);
    }
    const topDevs = Array.from(devMap.values())
      .sort((a, b) => b.totalEth - a.totalEth)
      .slice(0, 20);

    // 3. Recently Buried
    const recentlyBuried = [...graves]
      .sort((a, b) => new Date(b.buriedAt).getTime() - new Date(a.buriedAt).getTime())
      .slice(0, 20);

    return NextResponse.json({
      topGraves,
      topDevs,
      recentlyBuried,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Leaderboard fetch failed' }, { status: 500 });
  }
}
