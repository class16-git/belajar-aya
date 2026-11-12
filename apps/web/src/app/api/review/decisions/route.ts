import { prisma } from '@atlas/database';
import { audit } from '@/lib/server/audit';
import { findExpansion } from '@/lib/server/expansion';
import { parentRoute } from '@/lib/server/guards';
import { json, parseBody } from '@/lib/server/http';
import { rateLimit } from '@/lib/server/rate-limit';
import { assertDecisionAllowed, decisionSchema } from '@/lib/server/review';

/**
 * Parent records a content review decision for one expansion item at one version. Family-scoped, origin-checked
 * (handle → assertSameOrigin), parent-only (child mode → 403), rate-limited. Never a religious/scholarly approval.
 */
export const POST = parentRoute('review.decide', async (req, auth) => {
  await rateLimit(`review-decide:${auth.user.id}`, 60, 3600);
  const body = await parseBody(req, decisionSchema);
  const entry = assertDecisionAllowed(await findExpansion(body.itemId), body);
  const row = await prisma.contentReviewDecision.create({
    data: {
      familyId: auth.family.id,
      itemId: entry.item.id,
      itemVersion: entry.item.version,
      decision: body.decision,
      reviewerName: body.reviewerName,
      reviewerRole: body.reviewerRole,
      note: body.note,
    },
    select: { id: true, createdAt: true },
  });
  await audit(auth.family.id, auth.user.id, 'content.review_decided', 'content', entry.item.id, { decision: body.decision, religious: entry.religious });
  return json({ id: row.id, createdAt: row.createdAt.toISOString(), religious: entry.religious }, 201);
});
