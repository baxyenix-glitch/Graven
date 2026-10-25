import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial stats snapshot
      const initialStats = db.getStats();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialStats)}\n\n`));

      // 2. Heartbeat interval
      const interval = setInterval(() => {
        try {
          const fresh = db.getStats();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(fresh)}\n\n`));
        } catch {
          clearInterval(interval);
        }
      }, 5000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
