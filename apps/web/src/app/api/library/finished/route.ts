import { z } from 'zod';
import { prisma } from '@atlas/database';
import { childRoute } from '@/lib/server/guards';
import { HttpError, json, parseBody } from '@/lib/server/http';
import { rateLimit } from '@/lib/server/rate-limit';
import { childShelf } from '@/lib/server/library';

const schema = z.object({ bookId: z.string().regex(/^book-[a-z0-9-]+$/).max(120) }).strict();

/** Child says "I finished this book". Only books on their own shelf; no score, no streaks. */
export const POST = childRoute('library.child_finished', async (req, _auth, child) => {
  await rateLimit(`library-finished:${child.id}`, 30, 3600);
  const { bookId } = await parseBody(req, schema);
  if (!(await childShelf(child.id)).some((b) => b.id === bookId)) throw new HttpError(404, 'NOT_FOUND');
  await prisma.readingEvent.create({ data: { childId: child.id, bookId, kind: 'CHILD_FINISHED', observedAt: new Date(), parentAssisted: false } });
  return json({ ok: true }, 201);
});
