import 'server-only';
import { prisma } from '@atlas/database';
import { curriculumVersion } from '@atlas/curriculum';
import type { Auth } from './session';
import { isoFromDbDate } from './children';
import { clearRateLimits } from './rate-limit';

/** Portable export of everything stored for the family. Secrets (hashes, session ids) are excluded. */
export async function buildExport(auth: Auth) {
  const family = await prisma.family.findUniqueOrThrow({
    where: { id: auth.family.id },
    include: {
      consents: true,
      auditEvents: { orderBy: { createdAt: 'asc' } },
      reviewDecisions: { orderBy: { createdAt: 'asc' } },
      children: {
        include: {
          learningSessions: true,
          activities: true,
          attempts: true,
          mastery: true,
          observations: true,
          recommendations: true,
          readingEvents: true,
          shelf: true,
        },
      },
    },
  });
  return {
    format: 'atlas-family-export',
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    curriculumVersion: curriculumVersion(),
    parent: { email: auth.user.email, locale: auth.user.locale, createdAt: auth.user.createdAt },
    family: { id: family.id, consentVersion: family.consentVersion, libraryExternalLinks: family.libraryExternalLinks, createdAt: family.createdAt },
    consents: family.consents,
    children: family.children.map(({ dateOfBirth, ...c }) => ({ ...c, dateOfBirth: isoFromDbDate(dateOfBirth) })),
    auditEvents: family.auditEvents,
    contentReviewDecisions: family.reviewDecisions,
  };
}

/** Hard delete. Cascades remove family, children, attempts, observations, logs and sessions. */
export async function deleteFamily(auth: Auth): Promise<void> {
  await prisma.parentUser.delete({ where: { id: auth.user.id } });
  const u = auth.user.id;
  await clearRateLimits([`signin-email:${auth.user.email}`, `pin-set:${u}`, `pin-user:${u}`, `delete:${u}`, `pin:${auth.session.id}`]);
}
