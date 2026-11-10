import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { assertDbRole, DbRoleError } from '../../../../../packages/database/src/db-role';

// Review finding R-F2: builds must check WHICH database they are connected to, not just environment labels.
const baseUrl = process.env.DATABASE_URL!;
const admin = new PrismaClient({ datasources: { db: { url: baseUrl } } });
const created: string[] = [];
async function scratchDb(): Promise<{ url: string; client: PrismaClient }> {
  const name = `atlas_role_${randomBytes(4).toString('hex')}`;
  await admin.$executeRawUnsafe(`CREATE DATABASE ${name}`);
  created.push(name);
  const url = baseUrl.replace(/\/[^/?]+(\?|$)/, `/${name}$1`);
  return { url, client: new PrismaClient({ datasources: { db: { url } } }) };
}

beforeAll(async () => {
  await admin.$connect();
});
afterAll(async () => {
  for (const n of created) await admin.$executeRawUnsafe(`DROP DATABASE IF EXISTS ${n} WITH (FORCE)`);
  await admin.$disconnect();
});

describe('database role guard', () => {
  it('claims an empty database for the requested role, then only matches that role', async () => {
    const { client } = await scratchDb();
    expect(await assertDbRole(client, 'synthetic')).toBe('claimed');
    expect(await assertDbRole(client, 'synthetic')).toBe('matched');
    await expect(assertDbRole(client, 'production')).rejects.toBeInstanceOf(DbRoleError);
    await client.$disconnect();
  });

  it('never claims an unmarked database holding real (non-demo) parents as synthetic', async () => {
    const { client } = await scratchDb();
    await client.$executeRawUnsafe('CREATE TABLE "ParentUser" ("email" text)');
    await client.$executeRawUnsafe(`INSERT INTO "ParentUser" VALUES ('real.parent@gmail.invalid')`);
    await expect(assertDbRole(client, 'synthetic')).rejects.toThrow(/non-demo/);
    expect(await assertDbRole(client, 'production')).toBe('claimed');
    await client.$disconnect();
  });

  it('a freshly claimed database can still be migrated (marker lives outside the public schema)', () => {
    return (async () => {
      const { url, client } = await scratchDb();
      await assertDbRole(client, 'synthetic');
      await client.$disconnect();
      const r = spawnSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
        cwd: join(process.cwd(), '../../packages/database'),
        env: { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '', DATABASE_URL: url } as unknown as NodeJS.ProcessEnv,
        encoding: 'utf8',
        timeout: 120_000,
      });
      expect(r.stdout + r.stderr).toMatch(/successfully applied/);
      expect(r.status).toBe(0);
    })();
  }, 150_000);

  it('a PREVIEW build against a database marked production stops before migrations or seeding', async () => {
    const { url, client } = await scratchDb();
    await assertDbRole(client, 'production');
    await client.$disconnect();
    const r = spawnSync(process.execPath, [join(process.cwd(), 'scripts/vercel-build.mjs')], {
      env: { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '', DATABASE_URL: url, ATLAS_ENV: 'preview', VERCEL_ENV: 'preview' } as unknown as NodeJS.ProcessEnv,
      encoding: 'utf8',
      timeout: 120_000,
    });
    expect(r.status).not.toBe(0);
    expect(r.stdout + r.stderr).toMatch(/marked "production"/);
    expect(r.stdout).not.toMatch(/migrations? (found|applied)/i);
    expect(r.stdout).not.toMatch(/Seeded synthetic demo family/);
  }, 150_000);
});
