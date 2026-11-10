import 'server-only';
import { redirect } from 'next/navigation';
import { CONSENT_VERSION, isLocale, type Locale } from '@atlas/shared';
import { prisma, type ChildProfile } from '@atlas/database';
import { cookies } from 'next/headers';
import { getAuth, type Auth } from './session';
import { handle, HttpError } from './http';

export const hasConsent = (a: Auth) => a.family.consentVersion === CONSENT_VERSION;

/** Pages in the parent area. Child mode locks the parent area until the PIN is entered. */
export async function requireParentPage(opts: { allowNoConsent?: boolean } = {}): Promise<Auth> {
  const auth = await getAuth();
  if (!auth) redirect('/signin');
  if (auth.session.childModeChildId) redirect('/learn');
  if (!opts.allowNoConsent && !hasConsent(auth)) redirect('/consent');
  return auth;
}

export async function requireChildPage(): Promise<{ auth: Auth; child: ChildProfile }> {
  const auth = await getAuth();
  if (!auth) redirect('/signin');
  if (!auth.session.childModeChildId) redirect('/family');
  if (!hasConsent(auth)) redirect('/consent');
  const child = await prisma.childProfile.findFirst({
    where: { id: auth.session.childModeChildId, familyId: auth.family.id },
  });
  if (!child) redirect('/family');
  return { auth, child };
}

/** IDOR protection: a child is only found through the caller's own family. 404 avoids enumeration. */
export async function ownedChild(auth: Auth, childId: string): Promise<ChildProfile> {
  const child = await prisma.childProfile.findFirst({ where: { id: childId, familyId: auth.family.id } });
  if (!child) throw new HttpError(404, 'NOT_FOUND');
  return child;
}

type Ctx = { params: Promise<Record<string, string>> };

export function parentRoute(
  name: string,
  fn: (req: Request, auth: Auth, ctx: Ctx) => Promise<Response>,
  opts: { requireConsent?: boolean } = { requireConsent: true },
) {
  return handle(name, async (req, ctx) => {
    const auth = await getAuth();
    if (!auth) throw new HttpError(401, 'UNAUTHENTICATED');
    if (auth.session.childModeChildId) throw new HttpError(403, 'PARENT_GATE');
    if (opts.requireConsent !== false && !hasConsent(auth)) throw new HttpError(403, 'CONSENT_REQUIRED');
    return fn(req, auth, ctx);
  });
}

export function childRoute(name: string, fn: (req: Request, auth: Auth, child: ChildProfile, ctx: Ctx) => Promise<Response>) {
  return handle(name, async (req, ctx) => {
    const auth = await getAuth();
    if (!auth) throw new HttpError(401, 'UNAUTHENTICATED');
    if (!auth.session.childModeChildId) throw new HttpError(403, 'CHILD_MODE_REQUIRED');
    if (!hasConsent(auth)) throw new HttpError(403, 'CONSENT_REQUIRED');
    const child = await prisma.childProfile.findFirst({
      where: { id: auth.session.childModeChildId, familyId: auth.family.id },
    });
    if (!child) throw new HttpError(403, 'CHILD_MODE_REQUIRED');
    return fn(req, auth, child, ctx);
  });
}

export const LOCALE_COOKIE = 'atlas_locale';

/** Locale: child's in child mode, parent's otherwise, cookie for signed-out pages. */
export async function currentLocale(): Promise<Locale> {
  const auth = await getAuth();
  if (auth?.session.childModeChildId) {
    const c = await prisma.childProfile.findFirst({
      where: { id: auth.session.childModeChildId, familyId: auth.family.id },
      select: { locale: true },
    });
    if (c && isLocale(c.locale)) return c.locale;
  }
  if (auth && isLocale(auth.user.locale)) return auth.user.locale;
  const c = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(c) ? c : 'en';
}
