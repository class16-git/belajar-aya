import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const script = join(process.cwd(), 'scripts/vercel-build.mjs');
const run = (env: Record<string, string>) =>
  spawnSync(process.execPath, [script], { env: { PATH: process.env.PATH ?? '', ...env } as unknown as NodeJS.ProcessEnv, encoding: 'utf8' });

describe('vercel-build fail-closed (review finding F2)', () => {
  it('refuses a production deployment labelled preview before touching the database', () => {
    const r = run({ VERCEL_ENV: 'production', ATLAS_ENV: 'preview', DATABASE_URL: 'postgresql://nobody@127.0.0.1:1/none' });
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain('Refusing to build');
    expect(r.stdout).not.toContain('prisma');
  });
  it('refuses to build without a database', () => {
    const r = run({ ATLAS_ENV: 'preview' });
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain('DATABASE_URL is not set');
  });
});
