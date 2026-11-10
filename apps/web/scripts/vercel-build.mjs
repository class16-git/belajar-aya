/**
 * Vercel build (Root Directory = apps/web). Runs migrations and, in PREVIEW only, seeds the synthetic demo family.
 * Production (ATLAS_ENV unset or "production") never seeds.
 */
import { execSync } from 'node:child_process';

const run = (cmd, env = {}) => execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });
const atlasEnv = process.env.ATLAS_ENV ?? 'production';
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Add a Postgres database (e.g. the Neon integration) to the Vercel project.');
  process.exit(1);
}
// Migrations need a direct (non-pooled) connection when one is provided (Neon sets DATABASE_URL_UNPOOLED).
const direct = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

run('pnpm --filter @atlas/database generate');
run('pnpm --filter @atlas/database migrate:deploy', { DATABASE_URL: direct });
if (atlasEnv === 'preview') {
  console.log('Preview environment: seeding the synthetic demo family.');
  run('pnpm --filter @atlas/database seed', { DATABASE_URL: direct });
} else {
  console.log(`ATLAS_ENV=${atlasEnv}: skipping demo seed.`);
}
run('pnpm exec next build');
