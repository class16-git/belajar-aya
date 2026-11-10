import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const dbPkg = join(process.cwd(), '../../packages/database');
const runPrivateSeed = (url: string) =>
  spawnSync('pnpm', ['exec', 'tsx', 'src/seed-private.ts'], {
    cwd: dbPkg,
    env: { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '', DATABASE_URL: url } as unknown as NodeJS.ProcessEnv,
    encoding: 'utf8',
    timeout: 60_000,
  });

describe('private seed (N5: must never run against a remote database)', () => {
  it('refuses a non-local DATABASE_URL before connecting', () => {
    const r = runPrivateSeed('postgresql://u:p@db.example-host.invalid:5432/prod');
    expect(r.status).not.toBe(0);
    expect(r.stderr).toMatch(/local database/i);
  });
});
