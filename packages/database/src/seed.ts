/** Public demo seed — SYNTHETIC learners only. Safe for CI, screenshots and previews. */
import { PrismaClient } from '@prisma/client';
import { seedFamily, type SeedFamily } from './seed-lib';

export const DEMO_FAMILY: SeedFamily = {
  email: 'demo.parent@example.test',
  password: 'demo-password-123',
  pin: '1357',
  timezone: 'Asia/Jakarta',
  learners: [
    { nickname: 'Adek', dateOfBirth: '2024-05-20', schoolGrade: null, mode: 'TODDLER_OFFLINE' },
    {
      nickname: 'Kakak',
      dateOfBirth: '2019-08-15',
      schoolGrade: 'Grade 1',
      mode: 'ELEMENTARY_GUIDED',
    },
  ],
};

const prisma = new PrismaClient();
seedFamily(prisma, DEMO_FAMILY)
  .then(() => console.log(`Seeded synthetic demo family: ${DEMO_FAMILY.email}`))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
