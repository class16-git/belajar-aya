import { prisma } from '@atlas/database';
import { getCatalog } from '@atlas/curriculum';
import { NextResponse } from 'next/server';
import { logError } from '@/lib/server/log';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const c = getCatalog();
    return NextResponse.json({ ok: true, db: true, curriculumVersion: c.curriculumVersion, ai: 'disabled' });
  } catch (e) {
    logError('health.failed', e);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
