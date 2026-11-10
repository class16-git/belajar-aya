import { z } from 'zod';
import { prisma } from '@atlas/database';
import { hashSecret, verifySecret } from '@atlas/shared/server';
import { audit } from '@/lib/server/audit';
import { parentRoute } from '@/lib/server/guards';
import { HttpError, json, parseBody } from '@/lib/server/http';
import { rateLimit } from '@/lib/server/rate-limit';

const schema = z.object({ pin: z.string().regex(/^\d{4,8}$/), password: z.string().max(200) }).strict();

/** Setting/changing the PIN requires the account password (fresh parent authentication). */
export const POST = parentRoute('pin.set', async (req, auth) => {
  await rateLimit(`pin-set:${auth.user.id}`, 10, 900);
  const body = await parseBody(req, schema);
  if (!(await verifySecret(body.password, auth.user.passwordHash))) throw new HttpError(401, 'INVALID_CREDENTIALS');
  await prisma.parentUser.update({ where: { id: auth.user.id }, data: { pinHash: await hashSecret(body.pin) } });
  await audit(auth.family.id, auth.user.id, 'pin.set', 'parent', auth.user.id);
  return json({ ok: true });
}, { requireConsent: false });
