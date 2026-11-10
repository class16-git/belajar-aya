import { z } from 'zod';
import { responseSchema } from '@atlas/assessment';
import { childRoute } from '@/lib/server/guards';
import { json, parseBody } from '@/lib/server/http';
import { submitAttempt } from '@/lib/server/learning';

// Strict schema: any client-sent "correct" or score field is rejected outright.
const schema = z.object({ activityId: z.string().min(1).max(40), response: responseSchema }).strict();

export const POST = childRoute('attempts.create', async (req, _auth, child) => {
  const body = await parseBody(req, schema);
  return json(await submitAttempt(child, body.activityId, body.response.value));
});
