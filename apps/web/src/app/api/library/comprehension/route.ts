import { z } from 'zod';
import { gradePassage } from '@atlas/curriculum';
import { Prisma, prisma } from '@atlas/database';
import { childRoute } from '@/lib/server/guards';
import { HttpError, json, parseBody } from '@/lib/server/http';
import { rateLimit } from '@/lib/server/rate-limit';
import { passagesForChild, readingStage } from '@/lib/server/library';

const schema = z.object({
  passageId: z.string().regex(/^passage-[a-z0-9-]+$/).max(80),
  /** Server-issued per page view (ATL-05): a retried or double-submitted check is recorded once. */
  attemptId: z.string().uuid(),
  answers: z.record(z.string().regex(/^q[0-9]+$/), z.number().int().min(0).max(3)),
}).strict();

/**
 * Server-graded comprehension check on an Atlas-original passage for the child's own stage. The answer key never
 * leaves the server; results (and the paragraph holding the evidence) are returned only after answering.
 * ATL-05: idempotent per attemptId; only the first check of a passage is a "first attempt"; assistance is unknown
 * in child mode, so it is never recorded as unassisted.
 */
export const POST = childRoute('library.comprehension', async (req, _auth, child) => {
  await rateLimit(`library-comprehension:${child.id}`, 30, 3600);
  const body = await parseBody(req, schema);
  const passage = passagesForChild(readingStage(child)).find((p) => p.id === body.passageId);
  if (!passage) throw new HttpError(404, 'NOT_FOUND');

  const replay = async () => {
    const prev = await prisma.readingEvent.findUnique({ where: { attemptId: body.attemptId } });
    if (!prev || prev.childId !== child.id || prev.passageId !== passage.id) throw new HttpError(409, 'ATTEMPT_CONFLICT');
    const graded = gradePassage(passage, (prev.answers ?? {}) as Record<string, number>);
    return json({ ...graded, firstAttempt: prev.firstAttempt === true, replayed: true });
  };
  const existing = await prisma.readingEvent.findUnique({ where: { attemptId: body.attemptId }, select: { id: true } });
  if (existing) return replay();

  const ids = new Set(passage.questions.map((q) => q.id));
  if (Object.keys(body.answers).some((k) => !ids.has(k)) || Object.keys(body.answers).length !== ids.size) throw new HttpError(400, 'VALIDATION_ERROR');
  const graded = gradePassage(passage, body.answers);
  const earlier = await prisma.readingEvent.count({ where: { childId: child.id, passageId: passage.id, kind: 'COMPREHENSION_CHECK' } });
  try {
    await prisma.readingEvent.create({
      data: {
        childId: child.id,
        passageId: passage.id,
        kind: 'COMPREHENSION_CHECK',
        observedAt: new Date(),
        parentAssisted: null,
        attemptId: body.attemptId,
        firstAttempt: earlier === 0,
        answers: body.answers,
        correct: graded.correct,
        total: graded.total,
      },
    });
  } catch (e) {
    // A concurrent duplicate of the same attempt won the race: return its stored result.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return replay();
    throw e;
  }
  return json({ ...graded, firstAttempt: earlier === 0, replayed: false });
});
