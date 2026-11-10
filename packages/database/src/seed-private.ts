/**
 * Seeds REAL learner profiles from the git-ignored config/learners.private.json into a LOCAL database.
 * Never run against shared, CI or preview databases. Never commit the private file.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { seedFamily, type SeedFamily } from './seed-lib';

// Real learner data may only ever be written to a database on this machine.
const host = (() => {
  try {
    return new URL(process.env.DATABASE_URL ?? '').hostname;
  } catch {
    return '';
  }
})();
if (!['localhost', '127.0.0.1', '::1', '[::1]'].includes(host)) {
  console.error('Refusing to seed private learner data: DATABASE_URL must point to a local database (localhost).');
  process.exit(2);
}
const path = join(import.meta.dirname, '../../../config/learners.private.json');
if (!existsSync(path)) {
  console.error(
    'config/learners.private.json not found. Copy config/learners.private.example.json and edit it locally.',
  );
  process.exit(2);
}
if (process.env.CI) {
  console.error('Refusing to seed private learner data in CI.');
  process.exit(2);
}
const cfg = JSON.parse(readFileSync(path, 'utf8'));
const family: SeedFamily = {
  email: cfg.parent.email,
  password: cfg.parent.password,
  pin: cfg.parent.pin,
  timezone: cfg.timezone ?? 'Asia/Jakarta',
  learners: cfg.learners,
};
const prisma = new PrismaClient();
seedFamily(prisma, family)
  .then(() => console.log(`Seeded ${family.learners.length} private learner profile(s) locally.`))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
