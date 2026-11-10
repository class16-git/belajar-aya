import { masteryStatus } from '@atlas/adaptive';
import { getCatalog, visibleLessons } from '@atlas/curriculum';
import { prisma } from '@atlas/database';
import { cardBandsFor, interactiveBandsForGrade } from '@/lib/server/availability';
import { ageContext } from '@/lib/server/children';
import { config } from '@/lib/server/config';
import { ownedChild, parentRoute } from '@/lib/server/guards';
import { HttpError, json } from '@/lib/server/http';
import { toEngineState } from '@/lib/server/learning';

/**
 * GET /api/skills?childId= — eligible curated skills for one of the caller's children.
 * ATL-06: uses the same canonical eligibility as the learning flow — grade-based on-screen bands when screen
 * activities are allowed (none for unsupported grades), otherwise the age-based offline card bands.
 */
export const GET = parentRoute('skills.list', async (req, auth) => {
  const childId = new URL(req.url).searchParams.get('childId');
  if (!childId) throw new HttpError(400, 'VALIDATION_ERROR');
  const child = await ownedChild(auth, childId);
  const ctx = ageContext(child);
  const screen = ctx.policy.childScreenActivitiesAllowed;
  const bands = screen ? interactiveBandsForGrade(child.schoolGrade) : cardBandsFor(ctx.age?.years ?? null, child.transitionAcknowledged);
  const lessons = visibleLessons(config.minReview);
  const mastery = await prisma.masteryState.findMany({ where: { childId: child.id } });
  const now = new Date();
  const skills = getCatalog()
    .skills.filter((s) => bands.includes(s.band) && lessons.some((l) => l.skillId === s.id))
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      const m = mastery.find((x) => x.skillId === s.id);
      return { id: s.id, band: s.band, title: s.title, prerequisites: s.prerequisites, status: masteryStatus(m ? toEngineState(m) : null, now) };
    });
  return json({ mode: screen ? 'interactive' : 'offline', supported: bands.length > 0, band: bands[0] ?? null, bands, skills });
});
