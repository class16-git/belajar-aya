import { z } from 'zod';
import { childRoute } from '@/lib/server/guards';
import { json, parseBody } from '@/lib/server/http';
import { startSession } from '@/lib/server/learning';

const schema = z.object({ lessonId: z.string().max(80).optional() }).strict();

export const POST = childRoute('learn.session.start', async (req, _auth, child) => {
  const { lessonId } = await parseBody(req, schema);
  const session = await startSession(child, lessonId);
  return json({ sessionId: session.id }, 201);
});
