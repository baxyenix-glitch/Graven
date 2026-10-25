import { NextRequest, NextResponse } from 'next/server';
import { db, persistStatsCache, createDailyBackup } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  try {
    const expectedSecret = process.env.CRON_SECRET || 'graven_super_secure_cron_secret_v3';

    // Verify secret via Bearer token, custom header, or query param
    const authHeader = req.headers.get('authorization');
    const customHeader = req.headers.get('x-cron-secret');
    const searchParams = req.nextUrl.searchParams;
    const queryKey = searchParams.get('key');

    let providedSecret = '';
    if (authHeader?.startsWith('Bearer ')) {
      providedSecret = authHeader.slice(7).trim();
    } else if (customHeader) {
      providedSecret = customHeader.trim();
    } else if (queryKey) {
      providedSecret = queryKey.trim();
    }

    if (!providedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized. Invalid cron secret.' }, { status: 401 });
    }

    // 1. Recalculate and persist stats cache
    await persistStatsCache();

    // 2. Perform daily backup (pruning backups > 14 days)
    await createDailyBackup();

    const currentStats = db.getStats();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      action: 'CRON_MAINTENANCE_COMPLETED',
      backupCreated: true,
      stats: currentStats,
    });
  } catch (err: any) {
    console.error('Cron maintenance error:', err);
    return NextResponse.json(
      { error: err.message || 'Cron task encountered an error' },
      { status: 500 }
    );
  }
}
