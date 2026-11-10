import { z } from 'zod';
import { prisma } from '@atlas/database';
import { verifySecret } from '@atlas/shared/server';
import { audit } from '@/lib/server/audit';
import { clientIp, handle, HttpError, json, parseBody } from '@/lib/server/http';
import { rateLimit } from '@/lib/server/rate-limit';
import { createSession, getAuth } from '@/lib/server/session';

const schema = z.object({ email: z.string().trim().toLowerCase().max(200), password: z.string().max(200) }).strict();
// Constant-work dummy hash so unknown emails take as long as wrong passwords.
const DUMMY = ['scrypt', 16384, 8, 1, 'AAAAAAAAAAAAAAAAAAAAAA==', 'A'.repeat(86) + '=='].join('$');

export const POST = handle('auth.signin', async (req) => {
  // A child in child mode must not be able to replace the locked session (leaving needs the parent PIN).
  if ((await getAuth())?.session.childModeChildId) throw new HttpError(403, 'PARENT_GATE');
  const body = await parseBody(req, schema);
  await rateLimit(`signin:${clientIp(req)}`, 20, 900);
  // Per (email, IP) so a third party cannot lock the parent out; plus a looser per-email cap against
  // distributed guessing.
  await rateLimit(`signin-email-ip:${body.email}:${clientIp(req)}`, 8, 900);
  await rateLimit(`signin-email:${body.email}`, 30, 3600);
  const user = await prisma.parentUser.findUnique({ where: { email: body.email }, include: { family: true } });
  const ok = await verifySecret(body.password, user?.passwordHash ?? DUMMY);
  if (!user || !ok) throw new HttpError(401, 'INVALID_CREDENTIALS');
  await createSession(user.id);
  await audit(user.family?.id ?? null, user.id, 'auth.signin', 'parent', user.id);
  return json({ ok: true });
});
