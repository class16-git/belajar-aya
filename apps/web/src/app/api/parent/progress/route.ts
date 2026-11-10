import { ownedChild, parentRoute } from '@/lib/server/guards';
import { HttpError, json } from '@/lib/server/http';
import { buildProgress } from '@/lib/server/progress';

export const GET = parentRoute('progress.get', async (req, auth) => {
  const childId = new URL(req.url).searchParams.get('childId');
  if (!childId) throw new HttpError(400, 'VALIDATION_ERROR');
  const child = await ownedChild(auth, childId);
  const p = await buildProgress(child);
  return json({
    childId: child.id,
    localDate: p.ctx.localDate,
    safetyBand: p.ctx.policy.band,
    recommendation: p.recommendation,
    skills: p.skills.map((s) => ({ ...s, skill: { id: s.skill.id, title: s.skill.title } })),
    misconceptions: p.misconceptions,
    dueReviews: p.dueReviews.map((s) => s.skill.id),
    suggestedCards: p.suggestedCards.map((c) => c.id),
    observations: p.observations,
  });
});
