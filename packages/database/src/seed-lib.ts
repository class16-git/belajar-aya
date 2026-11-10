import { CONSENT_VERSION } from '@atlas/shared';
import { hashSecret } from '@atlas/shared/server';
import type { ChildMode, PrismaClient } from '@prisma/client';

export { CONSENT_VERSION };

export interface SeedLearner {
  nickname: string;
  dateOfBirth: string | null;
  schoolGrade: string | null;
  mode: ChildMode;
}

export interface SeedFamily {
  email: string;
  password: string;
  pin: string;
  timezone: string;
  learners: SeedLearner[];
}

/** Idempotent: re-running replaces the family for this email. */
export async function seedFamily(prisma: PrismaClient, f: SeedFamily): Promise<void> {
  if (process.env.NODE_ENV === 'production') throw new Error('Refusing to seed in production');
  await prisma.parentUser.deleteMany({ where: { email: f.email.toLowerCase() } });
  const user = await prisma.parentUser.create({
    data: {
      email: f.email.toLowerCase(),
      passwordHash: await hashSecret(f.password),
      pinHash: await hashSecret(f.pin),
      family: { create: { consentVersion: CONSENT_VERSION } },
    },
    include: { family: true },
  });
  const familyId = user.family!.id;
  await prisma.consentRecord.create({ data: { familyId, version: CONSENT_VERSION } });
  for (const l of f.learners) {
    await prisma.childProfile.create({
      data: {
        familyId,
        nickname: l.nickname,
        dateOfBirth: l.dateOfBirth ? new Date(`${l.dateOfBirth}T00:00:00Z`) : null,
        timezone: f.timezone,
        schoolGrade: l.schoolGrade,
        mode: l.mode,
      },
    });
  }
  await prisma.auditEvent.create({
    data: {
      familyId,
      actorId: user.id,
      action: 'seed.family_created',
      targetType: 'family',
      targetId: familyId,
    },
  });
}
