import { z } from 'zod';
import { prisma } from '@atlas/database';
import { hashSecret } from '@atlas/shared/server';
import { audit } from '@/lib/server/audit';
import { clientIp, handle, HttpError, json, parseBody } from '@/lib/server/http';
import { rateLimit } from '@/lib/server/rate-limit';
import { createSession } from '@/lib/server/session';

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(12).max(200),
  locale: z.enum(['en', 'id']).default('en'),
}).strict();

export const POST = handle('auth.signup', async (req) => {
  await rateLimit(`signup:${clientIp(req)}`, 10, 3600);
  const body = await parseBody(req, schema);
  const exists = await prisma.parentUser.findUnique({ where: { email: body.email } });
  if (exists) throw new HttpError(409, 'EMAIL_EXISTS');
  const user = await prisma.parentUser.create({
    data: { email: body.email, passwordHash: await hashSecret(body.password), locale: body.locale, family: { create: {} } },
    include: { family: true },
  });
  await audit(user.family!.id, user.id, 'auth.signup', 'parent', user.id);
  await createSession(user.id);
  return json({ ok: true }, 201);
});
