import { z } from 'zod';
import { Prisma, prisma } from '@atlas/database';
import { isLocale } from '@atlas/shared';
import { gradeChildUnit, visibleChildUnit } from '@/lib/server/child-units';
import { childRoute } from '@/lib/server/guards';
import { HttpError, json, parseBody } from '@/lib/server/http';
import { rateLimit } from '@/lib/server/rate-limit';

const schema = z
  .object({
    /** Server-issued per page view: a retried or double-submitted check is recorded once. */
    attemptId: z.string().uuid(),
    /** Assessment item id → DISPLAY position (the server maps it to the authored index). */
    answers: z.record(z.string().regex(/^a[0-9]+$/).max(8), z.number().int().min(0).max(3)),
  })
  .strict();

/**
 * Server-graded check on an expansion learning unit, for the child's own stage and only when the unit is visible to
 * children in this deployment (404 otherwise). Idempotent per attemptId (same contract as the comprehension check):
 * a retry or concurrent duplicate returns the stored result. Assistance is unknown in child mode (parentAssisted null).
 */
export const POST = childRoute('units.check', async (req, _auth, child, ctx) => {
  await rateLimit(`unit-check:${child.id}`, 30, 3600);
  const { id } = await ctx.params;
  if (!id || !/^unit-[a-z0-9_-]+$/.test(id) || id.length > 120) throw new HttpError(404, 'NOT_FOUND');
  const body = await parseBody(req, schema);
  const unit = await visibleChildUnit(child, id);
  const locale = isLocale(child.locale) ? child.locale : 'en';

  const replay = async () => {
    const prev = await prisma.unitAttempt.findUnique({ where: { attemptId: body.attemptId } });
    if (!prev || prev.childId !== child.id || prev.unitId !== unit.id) throw new HttpError(409, 'ATTEMPT_CONFLICT');
    const graded = gradeChildUnit(unit, (prev.answers ?? {}) as Record<string, number>, locale);
    return json({ ...graded, firstAttempt: prev.firstAttempt, replayed: true });
  };
  const existing = await prisma.unitAttempt.findUnique({ where: { attemptId: body.attemptId }, select: { id: true } });
  if (existing) return replay();

  const graded = gradeChildUnit(unit, body.answers, locale); // 400 on unknown/missing items or out-of-range positions
  const earlier = await prisma.unitAttempt.count({ where: { childId: child.id, unitId: unit.id } });
  try {
    await prisma.unitAttempt.create({
      data: {
        childId: child.id,
        unitId: unit.id,
        unitVersion: unit.version,
        attemptId: body.attemptId,
        firstAttempt: earlier === 0,
        correct: graded.correct,
        total: graded.total,
        answers: body.answers,
        misconceptions: graded.misconceptions,
        parentAssisted: null,
      },
    });
  } catch (e) {
    // A concurrent duplicate of the same attempt won the race: return its stored result.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return replay();
    throw e;
  }
  return json({ ...graded, firstAttempt: earlier === 0, replayed: false });
});
