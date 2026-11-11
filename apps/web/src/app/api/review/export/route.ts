import { expansionSummary } from '@atlas/curriculum';
import { parentRoute } from '@/lib/server/guards';
import { exportDecisions, familyDecisions } from '@/lib/server/review';

/** The caller's family's review decisions as JSON, for apps/web/scripts/apply-reviews.mjs. */
export const GET = parentRoute('review.export', async (_req, auth) => {
  const rows = await familyDecisions(auth.family.id);
  const kinds = new Map(expansionSummary().items.map((x) => [x.id, x.kind] as const));
  const data = exportDecisions(rows, (id) => kinds.get(id) ?? null);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="atlas-review-decisions-${new Date().toISOString().slice(0, 10)}.json"`,
      'Cache-Control': 'no-store',
    },
  });
});
