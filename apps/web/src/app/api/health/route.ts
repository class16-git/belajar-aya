import { prisma } from '@atlas/database';
import { contentManifest } from '@atlas/curriculum';
import { NextResponse } from 'next/server';
import { config } from '@/lib/server/config';
import { logError } from '@/lib/server/log';

export const dynamic = 'force-dynamic';

/**
 * Liveness plus release reconciliation: the deployed commit and how much content this environment shows children.
 * Counts and a content digest only — no family, learner or content data (ATL-12).
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const m = contentManifest(config.minReview);
    return NextResponse.json({
      ok: true,
      db: true,
      curriculumVersion: m.curriculumVersion,
      ai: 'disabled',
      release: (process.env.VERCEL_GIT_COMMIT_SHA ?? 'local').slice(0, 7),
      deployment: process.env.VERCEL_DEPLOYMENT_ID ?? null,
      minReview: m.minReview,
      contentDigest: m.contentDigest,
      visible: m.visible,
    });
  } catch (e) {
    logError('health.failed', e);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
