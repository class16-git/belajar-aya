import { z } from 'zod';
import { verifySecret } from '@atlas/shared/server';
import { parentRoute } from '@/lib/server/guards';
import { HttpError, json, parseBody } from '@/lib/server/http';
import { logEvent } from '@/lib/server/log';
import { deleteFamily } from '@/lib/server/privacy';
import { rateLimit } from '@/lib/server/rate-limit';
import { destroySession } from '@/lib/server/session';

const schema = z.object({ confirm: z.literal('DELETE'), password: z.string().max(200) }).strict();

/** DELETE /api/parent/family — verified, permanent deletion of the whole family. */
export const DELETE = parentRoute('privacy.delete', async (req, auth) => {
  await rateLimit(`delete:${auth.user.id}`, 5, 900);
  const body = await parseBody(req, schema);
  if (!(await verifySecret(body.password, auth.user.passwordHash))) throw new HttpError(401, 'INVALID_CREDENTIALS');
  await deleteFamily(auth);
  await destroySession();
  logEvent('privacy.family_deleted'); // no identifiers retained
  return json({ ok: true });
}, { requireConsent: false });
