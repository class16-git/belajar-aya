import { z } from 'zod';
import { prisma } from '@atlas/database';
import { verifySecret } from '@atlas/shared/server';
import { audit } from '@/lib/server/audit';
import { handle, HttpError, json, parseBody } from '@/lib/server/http';
import { rateLimit } from '@/lib/server/rate-limit';
import { getAuth } from '@/lib/server/session';

const schema = z.object({ pin: z.string().regex(/^\d{4,8}$/) }).strict();

export const POST = handle('child_mode.exit', async (req) => {
  const auth = await getAuth();
  if (!auth) throw new HttpError(401, 'UNAUTHENTICATED');
  if (!auth.session.childModeChildId) return json({ ok: true });
  await rateLimit(`pin:${auth.session.id}`, 5, 600);
  // Account-wide daily cap so guesses cannot be spread across sessions/devices.
  await rateLimit(`pin-user:${auth.user.id}`, 20, 86_400);
  const { pin } = await parseBody(req, schema).catch(() => {
    throw new HttpError(401, 'WRONG_PIN');
  });
  if (!(await verifySecret(pin, auth.user.pinHash))) {
    await audit(auth.family.id, null, 'child_mode.pin_failed', 'session', null);
    throw new HttpError(401, 'WRONG_PIN');
  }
  await prisma.session.update({ where: { id: auth.session.id }, data: { childModeChildId: null } });
  await audit(auth.family.id, auth.user.id, 'child_mode.exited', 'child', auth.session.childModeChildId);
  return json({ ok: true });
});
