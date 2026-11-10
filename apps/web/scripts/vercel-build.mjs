/**
 * Vercel build (Root Directory = apps/web). Runs migrations and, in PREVIEW only, seeds the synthetic demo family.
 * Production (ATLAS_ENV unset or "production") never seeds.
 */
import { execSync } from 'node:child_process';

const run = (cmd, env = {}) => execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });
const atlasEnv = process.env.ATLAS_ENV ?? 'production';
// Fail closed BEFORE touching the database: a production deployment must never be labelled preview/development
// (that would show unreviewed lessons and seed demo accounts).
if (process.env.VERCEL_ENV === 'production' && atlasEnv !== 'production') {
  console.error(`Refusing to build: VERCEL_ENV=production but ATLAS_ENV=${atlasEnv}. Remove ATLAS_ENV from the Production environment.`);
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Add a Postgres database (e.g. the Neon integration) to the Vercel project.');
  process.exit(1);
}
// Migrations need a direct (non-pooled) connection when one is provided (Neon sets DATABASE_URL_UNPOOLED).
const direct = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

run('pnpm --filter @atlas/database generate');
// Check WHICH database this is before changing it: previews may only touch a "synthetic" database and
// production only a "production" one (marker stored in the database itself).
const expectedRole = atlasEnv === 'preview' || atlasEnv === 'development' ? 'synthetic' : 'production';
run(`pnpm --filter @atlas/database db-role ${expectedRole}`, { DATABASE_URL: direct });
run('pnpm --filter @atlas/database migrate:deploy', { DATABASE_URL: direct });
if (atlasEnv === 'preview') {
  console.log('Preview environment: seeding the synthetic demo family.');
  run('pnpm --filter @atlas/database seed', { DATABASE_URL: direct });
} else {
  console.log(`ATLAS_ENV=${atlasEnv}: skipping demo seed.`);
}
run('pnpm exec next build');
