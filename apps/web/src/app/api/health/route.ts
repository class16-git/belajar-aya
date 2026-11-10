import { prisma } from '@atlas/database';
import { getCatalog, isVisible } from '@atlas/curriculum';
import { NextResponse } from 'next/server';
import { config } from '@/lib/server/config';
import { libraryView } from '@/lib/server/library';
import { logError } from '@/lib/server/log';

export const dynamic = 'force-dynamic';

/**
 * Liveness plus release reconciliation: the deployed commit and how much content this environment shows children.
 * Counts only — no family, learner or content data.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const c = getCatalog();
    const lib = libraryView();
    return NextResponse.json({
      ok: true,
      db: true,
      curriculumVersion: c.curriculumVersion,
      ai: 'disabled',
      release: (process.env.VERCEL_GIT_COMMIT_SHA ?? 'local').slice(0, 7),
      minReview: config.minReview,
      visible: {
        lessons: c.lessons.filter((l) => isVisible(l, config.minReview)).length,
        books: lib.books.length,
        passages: lib.passages.length,
      },
    });
  } catch (e) {
    logError('health.failed', e);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
