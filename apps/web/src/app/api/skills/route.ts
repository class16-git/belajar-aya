import { masteryStatus } from '@atlas/adaptive';
import { getCatalog, visibleLessons } from '@atlas/curriculum';
import { prisma } from '@atlas/database';
import { ageContext } from '@/lib/server/children';
import { config } from '@/lib/server/config';
import { ownedChild, parentRoute } from '@/lib/server/guards';
import { HttpError, json } from '@/lib/server/http';
import { toEngineState } from '@/lib/server/learning';

/** GET /api/skills?childId= — eligible curated skills for one of the caller's children. */
export const GET = parentRoute('skills.list', async (req, auth) => {
  const childId = new URL(req.url).searchParams.get('childId');
  if (!childId) throw new HttpError(400, 'VALIDATION_ERROR');
  const child = await ownedChild(auth, childId);
  const ctx = ageContext(child);
  const band = ctx.policy.childScreenActivitiesAllowed ? 'g1' : 'toddler';
  const lessons = visibleLessons(config.minReview);
  const mastery = await prisma.masteryState.findMany({ where: { childId: child.id } });
  const now = new Date();
  const skills = getCatalog()
    .skills.filter((s) => s.band === band && lessons.some((l) => l.skillId === s.id))
    .map((s) => {
      const m = mastery.find((x) => x.skillId === s.id);
      return { id: s.id, title: s.title, prerequisites: s.prerequisites, status: masteryStatus(m ? toEngineState(m) : null, now) };
    });
  return json({ band, skills });
});
