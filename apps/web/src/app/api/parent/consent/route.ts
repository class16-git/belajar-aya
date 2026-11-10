import { z } from 'zod';
import { prisma } from '@atlas/database';
import { CONSENT_VERSION } from '@atlas/shared';
import { audit } from '@/lib/server/audit';
import { parentRoute } from '@/lib/server/guards';
import { json, parseBody } from '@/lib/server/http';

const schema = z.object({ agree: z.literal(true), version: z.literal(CONSENT_VERSION) }).strict();

export const POST = parentRoute('consent.grant', async (req, auth) => {
  await parseBody(req, schema);
  await prisma.$transaction([
    prisma.consentRecord.create({ data: { familyId: auth.family.id, version: CONSENT_VERSION } }),
    prisma.family.update({ where: { id: auth.family.id }, data: { consentVersion: CONSENT_VERSION } }),
  ]);
  await audit(auth.family.id, auth.user.id, 'consent.granted', 'family', auth.family.id, { version: CONSENT_VERSION });
  return json({ ok: true });
}, { requireConsent: false });

export const DELETE = parentRoute('consent.revoke', async (_req, auth) => {
  await prisma.$transaction([
    prisma.consentRecord.updateMany({ where: { familyId: auth.family.id, revokedAt: null }, data: { revokedAt: new Date() } }),
    prisma.family.update({ where: { id: auth.family.id }, data: { consentVersion: null } }),
  ]);
  await audit(auth.family.id, auth.user.id, 'consent.revoked', 'family', auth.family.id);
  return json({ ok: true });
}, { requireConsent: false });
