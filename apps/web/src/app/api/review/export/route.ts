import { findExpansion } from '@/lib/server/expansion';
import { parentRoute } from '@/lib/server/guards';
import { exportDecisions, familyDecisions } from '@/lib/server/review';

/** The caller's family's review decisions as JSON, for apps/web/scripts/apply-reviews.mjs. */
export const GET = parentRoute('review.export', async (_req, auth) => {
  const rows = await familyDecisions(auth.family.id);
  const data = exportDecisions(rows, (id) => findExpansion(id)?.kind ?? null);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="atlas-review-decisions-${new Date().toISOString().slice(0, 10)}.json"`,
      'Cache-Control': 'no-store',
    },
  });
});
