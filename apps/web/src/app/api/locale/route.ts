import { cookies } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@atlas/database';
import { LOCALE_COOKIE } from '@/lib/server/guards';
import { handle, HttpError, json, parseBody } from '@/lib/server/http';
import { getAuth } from '@/lib/server/session';

const schema = z.object({ locale: z.enum(['en', 'id']) }).strict();

/** Switching language never touches learning records (scenario 5). */
export const POST = handle('locale.set', async (req) => {
  const { locale } = await parseBody(req, schema);
  const auth = await getAuth();
  if (auth?.session.childModeChildId) throw new HttpError(403, 'PARENT_GATE');
  if (auth) await prisma.parentUser.update({ where: { id: auth.user.id }, data: { locale } });
  (await cookies()).set(LOCALE_COOKIE, locale, { httpOnly: false, sameSite: 'lax', path: '/', maxAge: 31536000 });
  return json({ ok: true });
});
