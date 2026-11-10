import { z } from 'zod';
import { childRoute } from '@/lib/server/guards';
import { json, parseBody } from '@/lib/server/http';
import { nextActivity } from '@/lib/server/learning';

const schema = z.object({ sessionId: z.string().min(1).max(40) }).strict();

/** Returns one activity. The payload never includes the answer key. */
export const POST = childRoute('activities.next', async (req, _auth, child) => {
  const { sessionId } = await parseBody(req, schema);
  return json(await nextActivity(child, sessionId));
});
