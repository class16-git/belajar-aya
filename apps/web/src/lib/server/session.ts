import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { prisma } from '@atlas/database';
import { newToken, sha256 } from '@atlas/shared/server';
import { config } from './config';

export const SESSION_COOKIE = 'atlas_session';

export async function createSession(userId: string): Promise<void> {
  const token = newToken();
  const expiresAt = new Date(Date.now() + config.sessionDays * 86_400_000);
  await prisma.session.create({ data: { id: sha256(token), userId, expiresAt } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.secureCookies,
    path: '/',
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { id: sha256(token) } });
  jar.delete(SESSION_COOKIE);
}

/** Resolve the current session once per request. */
export const getAuth = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { id: sha256(token) },
    include: { user: { include: { family: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  const { user, ...s } = session;
  const { family, ...u } = user;
  if (!family) return null;
  return { session: s, user: u, family };
});
export type Auth = NonNullable<Awaited<ReturnType<typeof getAuth>>>;
