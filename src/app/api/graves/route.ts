import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // all, pons, other, risen
    const sort = searchParams.get('sort') || 'newest'; // newest, views, earned
    const dev = (searchParams.get('dev') || searchParams.get('creator') || '').trim().toLowerCase();
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '12', 10)));

    let graves = db.getAllGraves();

    // Filter by creator / dev wallet if requested
    if (dev) {
      graves = graves.filter((g) => g.devWallet.toLowerCase() === dev);
    }

    // Filter by launchpad or state
    if (filter === 'pons') {
      graves = graves.filter((g) => g.launchpad === 'pons');
    } else if (filter === 'other') {
      graves = graves.filter((g) => g.launchpad === 'other');
    } else if (filter === 'risen') {
      graves = graves.filter((g) => g.isRisen);
    }

    // Query by token address, symbol, name, or dev wallet
    if (query) {
      graves = graves.filter(
        (g) =>
          g.tokenAddress.toLowerCase().includes(query) ||
          g.symbol.toLowerCase().includes(query) ||
          g.name.toLowerCase().includes(query) ||
          g.devWallet.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sort === 'views') {
      graves.sort((a, b) => b.viewsCount - a.viewsCount);
    } else if (sort === 'earned') {
      graves.sort((a, b) => b.totalEthEarned - a.totalEthEarned);
    } else {
      // newest first
      graves.sort((a, b) => new Date(b.buriedAt).getTime() - new Date(a.buriedAt).getTime());
    }

    const total = graves.length;
    const startIndex = (page - 1) * limit;
    const paginated = graves.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      graves: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to list graves' }, { status: 500 });
  }
}
