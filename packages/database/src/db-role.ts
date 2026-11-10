/**
 * Database identity guard (review finding R-F2).
 *
 * Environment labels alone cannot tell whether a build is connected to the right database: a preview deployment
 * could be wired to the production database by one checkbox. Each database therefore carries a one-row marker
 * of its role, checked BEFORE migrations or seeding:
 *   - "synthetic": demo/preview/CI data only. Preview builds require this.
 *   - "production": real families. Production builds require this; previews must never touch it.
 * An unmarked database is claimed for the requested role only if that is safe: a database that already holds
 * non-demo parent accounts is never claimed as "synthetic".
 *
 * Usage: tsx src/db-role.ts synthetic|production
 */
import { PrismaClient } from '@prisma/client';

export type DbRole = 'synthetic' | 'production';
export const DEMO_EMAIL_DOMAIN = '@example.test';

export class DbRoleError extends Error {}

export async function assertDbRole(prisma: PrismaClient, expected: DbRole): Promise<'claimed' | 'matched'> {
  // Kept in its own schema: Prisma Migrate only inspects "public", so a fresh database still counts as empty.
  await prisma.$executeRawUnsafe('CREATE SCHEMA IF NOT EXISTS atlas_meta');
  await prisma.$executeRawUnsafe(
    'CREATE TABLE IF NOT EXISTS atlas_meta.database_role ("id" INT PRIMARY KEY DEFAULT 1 CHECK ("id" = 1), "role" TEXT NOT NULL, "claimedAt" TIMESTAMPTZ NOT NULL DEFAULT now())',
  );
  const rows = await prisma.$queryRawUnsafe<{ role: string }[]>('SELECT "role" FROM atlas_meta.database_role WHERE "id" = 1');
  const current = rows[0]?.role;
  if (current) {
    if (current !== expected) {
      throw new DbRoleError(`This database is marked "${current}" but the build expects "${expected}". Refusing to continue.`);
    }
    return 'matched';
  }
  if (expected === 'synthetic') {
    const hasParentTable = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
      `SELECT to_regclass('public."ParentUser"') IS NOT NULL AS "exists"`,
    );
    if (hasParentTable[0]?.exists) {
      const real = await prisma.$queryRawUnsafe<{ n: bigint }[]>(
        `SELECT count(*) AS n FROM "ParentUser" WHERE "email" NOT LIKE '%${DEMO_EMAIL_DOMAIN}'`,
      );
      if (Number(real[0]?.n ?? 0) > 0) {
        throw new DbRoleError(
          'This unmarked database already contains non-demo parent accounts. Refusing to mark it "synthetic" or seed demo data.',
        );
      }
    }
  }
  await prisma.$executeRawUnsafe('INSERT INTO atlas_meta.database_role ("id", "role") VALUES (1, $1) ON CONFLICT DO NOTHING', expected);
  const after = await prisma.$queryRawUnsafe<{ role: string }[]>('SELECT "role" FROM atlas_meta.database_role WHERE "id" = 1');
  if (after[0]?.role !== expected) throw new DbRoleError('Database role changed concurrently. Refusing to continue.');
  return 'claimed';
}

const isMain = process.argv[1]?.endsWith('db-role.ts');
if (isMain) {
  const expected = process.argv[2];
  if (expected !== 'synthetic' && expected !== 'production') {
    console.error('Usage: tsx src/db-role.ts synthetic|production');
    process.exit(2);
  }
  const prisma = new PrismaClient();
  assertDbRole(prisma, expected)
    .then((r) => console.log(`Database role ${r === 'claimed' ? 'set to' : 'confirmed as'} "${expected}".`))
    .catch((e) => {
      console.error(e instanceof DbRoleError ? e.message : 'Database role check failed.');
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
