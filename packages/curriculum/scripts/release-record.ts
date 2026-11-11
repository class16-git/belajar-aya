/**
 * Records a VERIFIED production release manifest (docs/delivery/releases/<date>-<sha>.json and
 * docs/delivery/release-manifest.json for the latest).
 *
 *   pnpm release:record                       # production domain from ATLAS_RELEASE_URL or the default below
 *   VERCEL_TOKEN=… pnpm release:record        # also confirms the deployment state and full SHA from the Vercel API
 *
 * It only READS: the public /api/health endpoint, optionally the Vercel deployments API, and the local checkout.
 * It fails (exit 1) when the live content digest differs from the digest of the checked-out commit, or when the
 * checkout is not the deployed commit, so a manifest is never written for content that was not verified.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { contentManifest } from '../src/manifest';

const repo = join(import.meta.dirname, '../../..');
const base = (process.env.ATLAS_RELEASE_URL ?? 'https://atlas.ichlasulamalsudarmi.com').replace(/\/$/, '');
const curl = (url: string, headers: string[] = []) => execFileSync('curl', ['-sS', '--max-time', '30', ...headers.flatMap((h) => ['-H', h]), url], { encoding: 'utf8' });
const git = (...a: string[]) => execFileSync('git', a, { cwd: repo, encoding: 'utf8' }).trim();
const fail = (m: string): never => {
  console.error(`✗ ${m}`);
  process.exit(1);
};

const health = JSON.parse(curl(`${base}/api/health`)) as {
  ok: boolean; db: boolean; release: string; deployment: string | null; curriculumVersion: string; minReview: string; contentDigest: string; visible: Record<string, number>;
};
if (!health.ok || !health.db) fail(`health is not ok: ${JSON.stringify(health)}`);

// The deployed commit, resolved to its full SHA. The checkout may be that commit, or a descendant whose content and
// curriculum code are byte-identical to it (e.g. a docs-only commit recording this release).
const deployed = (() => {
  try { return git('rev-parse', '--verify', `${health.release}^{commit}`); } catch { return fail(`deployed commit ${health.release} is not in this checkout; git fetch first`); }
})();
const headSha = git('rev-parse', 'HEAD');
if (headSha !== deployed) {
  try { git('merge-base', '--is-ancestor', deployed, 'HEAD'); } catch { fail(`checkout ${headSha.slice(0, 7)} does not contain the deployed commit ${health.release}`); }
  const changed = git('diff', '--name-only', deployed, 'HEAD', '--', 'content', 'packages/curriculum/src');
  if (changed) fail(`content or curriculum code changed since the deployed commit:\n${changed}`);
}
const head = deployed;
const local = contentManifest(health.minReview as Parameters<typeof contentManifest>[0]);
if (local.contentDigest !== health.contentDigest) fail(`live content digest ${health.contentDigest} ≠ checkout digest ${local.contentDigest}`);
if (local.curriculumVersion !== health.curriculumVersion) fail(`curriculum version differs: live ${health.curriculumVersion}, checkout ${local.curriculumVersion}`);

// Optional: confirm the deployment from Vercel (state, target, full SHA, aliases, region).
let vercel: Record<string, unknown> | null = null;
const team = process.env.VERCEL_TEAM_ID ?? 'team_alLH1dex86u4p0qeYv7ymzIW';
if (health.deployment) {
  try {
    const auth = process.env.VERCEL_TOKEN ? [`Authorization: Bearer ${process.env.VERCEL_TOKEN}`] : ['Authorization: Bearer proxy-injected'];
    const d = JSON.parse(curl(`https://api.vercel.com/v13/deployments/${health.deployment}?teamId=${team}`, auth)) as { readyState?: string; target?: string; ready?: number; alias?: string[]; regions?: string[]; meta?: { githubCommitSha?: string } };
    if (d.readyState) {
      if (d.readyState !== 'READY' || d.target !== 'production') fail(`deployment ${health.deployment} is ${d.readyState}/${d.target}`);
      if (d.meta?.githubCommitSha && d.meta.githubCommitSha !== head) fail(`Vercel deployed ${d.meta.githubCommitSha}, health reports ${head}`);
      vercel = { readyState: d.readyState, target: d.target, readyAt: d.ready ? new Date(d.ready).toISOString() : null, aliases: d.alias ?? [], regions: d.regions ?? [], githubCommitSha: d.meta?.githubCommitSha ?? null };
    }
  } catch {
    vercel = null; // API not reachable without a token: the manifest says so instead of guessing
  }
}

const migrations = git('ls-tree', '--name-only', `${head}:packages/database/prisma/migrations`).split('\n').filter((f) => /^\d{14}_/.test(f)).sort();
const verifiedAt = new Date().toISOString();
const manifest = {
  schema: 'atlas-release-manifest/1',
  release: { gitSha: head, shortSha: head.slice(0, 7), commitDate: git('show', '-s', '--format=%cI', head), subject: git('show', '-s', '--format=%s', head) },
  deployment: { provider: 'vercel', id: health.deployment, url: base, vercel, vercelVerified: vercel !== null },
  curriculum: { version: health.curriculumVersion, minReview: health.minReview, contentDigest: health.contentDigest, digestMatchesCheckout: true, visible: health.visible },
  database: { migrationsInRelease: migrations, latestMigration: migrations.at(-1) ?? null, note: 'Applied by the Vercel build (vercel-build.mjs) after the database role check; see the build log.' },
  verification: { verifiedAt, by: process.env.ATLAS_VERIFIED_BY ?? 'release-record script', checks: ['GET /api/health ok and db true', headSha === head ? 'checkout HEAD equals deployed release' : `checkout ${headSha.slice(0, 7)} descends from the deployed release with identical content/ and curriculum code`, 'live contentDigest equals checkout contentDigest', 'curriculum version equal', vercel ? 'Vercel deployment READY, production target, same commit' : 'Vercel API not checked (no token)'] },
};
const dir = join(repo, 'docs/delivery/releases');
mkdirSync(dir, { recursive: true });
const name = `${verifiedAt.slice(0, 10)}-${head.slice(0, 7)}.json`;
const json = `${JSON.stringify(manifest, null, 2)}\n`;
writeFileSync(join(dir, name), json);
writeFileSync(join(repo, 'docs/delivery/release-manifest.json'), json);
console.log(`✓ verified ${head.slice(0, 7)} (${health.deployment ?? 'no deployment id'}) digest ${health.contentDigest}; wrote docs/delivery/releases/${name} and docs/delivery/release-manifest.json`);
