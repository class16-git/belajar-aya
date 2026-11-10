import { z } from 'zod';
import { gradePassage } from '@atlas/curriculum';
import { prisma } from '@atlas/database';
import { childRoute } from '@/lib/server/guards';
import { HttpError, json, parseBody } from '@/lib/server/http';
import { rateLimit } from '@/lib/server/rate-limit';
import { passagesForChild, readingStage } from '@/lib/server/library';

const schema = z.object({
  passageId: z.string().regex(/^passage-[a-z0-9-]+$/).max(80),
  answers: z.record(z.string().regex(/^q[0-9]+$/), z.number().int().min(0).max(3)),
}).strict();

/**
 * Server-graded comprehension check on an Atlas-original passage for the child's own stage. The answer key never
 * leaves the server; results (and the paragraph holding the evidence) are returned only after answering.
 */
export const POST = childRoute('library.comprehension', async (req, _auth, child) => {
  await rateLimit(`library-comprehension:${child.id}`, 30, 3600);
  const body = await parseBody(req, schema);
  const passage = passagesForChild(readingStage(child)).find((p) => p.id === body.passageId);
  if (!passage) throw new HttpError(404, 'NOT_FOUND');
  const ids = new Set(passage.questions.map((q) => q.id));
  if (Object.keys(body.answers).some((k) => !ids.has(k)) || Object.keys(body.answers).length !== ids.size) throw new HttpError(400, 'VALIDATION_ERROR');
  const graded = gradePassage(passage, body.answers);
  await prisma.readingEvent.create({
    data: { childId: child.id, passageId: passage.id, kind: 'COMPREHENSION_CHECK', observedAt: new Date(), parentAssisted: false, correct: graded.correct, total: graded.total },
  });
  return json(graded);
});
