import React from 'react';
import { db } from '@/lib/db';
import { HomeLiveView } from '@/components/home/HomeLiveView';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const graves = db.getAllGraves();
  const stats = db.getStats();

  return <HomeLiveView initialGraves={graves} initialStats={stats} />;
}
