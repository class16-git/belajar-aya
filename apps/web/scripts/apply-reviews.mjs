#!/usr/bin/env node
/**
 * Apply exported parent/educator review decisions (GET /api/review/export) to expansion content files.
 *
 *   node apps/web/scripts/apply-reviews.mjs <export.json> [--content-dir <dir>] [--dry-run]
 *
 * For each item the LATEST decision is applied:
 *   approve → review.reviewedBy / reviewerRole / reviewedAt, reviewStatus "reviewed" (never downgrades "published"),
 *             and any earlier review.rejectedReason is removed.
 *   reject  → review.rejectedReason (plus who/when); reviewStatus is left as it is.
 * Refuses (and leaves the file untouched) when the file's version differs from the reviewed version. Never reads or
 * writes religiousReview: a family's content review is not a scholarly approval. Exit code 1 if anything was refused.
 * Afterwards run `pnpm --filter @atlas/curriculum index` and `pnpm content:validate`.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ID = /^(unit|reading)-[a-z0-9_-]+$/;
const SEMVER = /^\d+\.\d+\.\d+$/;
const INITIALS = /^\p{L}[\p{L} .'’-]{0,39}$/u;
const SAFE = /^[^<>]*$/;

function usage(msg) {
  if (msg) console.error(`apply-reviews: ${msg}`);
  console.error('usage: node apps/web/scripts/apply-reviews.mjs <export.json> [--content-dir <dir>] [--dry-run]');
  process.exit(2);
}

function parseArgs(argv) {
  const out = { file: null, contentDir: resolve(here, '../../../content'), dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') out.dryRun = true;
    else if (a === '--content-dir') out.contentDir = resolve(argv[++i] ?? usage('--content-dir needs a path'));
    else if (a === '--') continue;
    else if (a.startsWith('--')) usage(`unknown option ${a}`);
    else if (!out.file) out.file = resolve(a);
    else usage('only one export file');
  }
  if (!out.file) usage();
  return out;
}

/** Strict validation of the export file; any malformed decision aborts the whole run before anything is written. */
export function validateExport(data) {
  if (!data || typeof data !== 'object' || data.format !== 'atlas-review-decisions' || data.formatVersion !== 1 || !Array.isArray(data.decisions)) {
    throw new Error('not an atlas-review-decisions v1 export');
  }
  return data.decisions.map((d, i) => {
    const bad = (what) => new Error(`decision #${i + 1}: ${what}`);
    if (!d || typeof d !== 'object') throw bad('not an object');
    if (typeof d.itemId !== 'string' || !ID.test(d.itemId)) throw bad('bad itemId');
    if (typeof d.itemVersion !== 'string' || !SEMVER.test(d.itemVersion)) throw bad('bad itemVersion');
    if (d.decision !== 'approve' && d.decision !== 'reject') throw bad('decision must be approve or reject');
    if (typeof d.reviewerName !== 'string' || !INITIALS.test(d.reviewerName)) throw bad('bad reviewerName');
    if (d.reviewerRole !== 'parent' && d.reviewerRole !== 'educator') throw bad('reviewerRole must be parent or educator');
    const note = typeof d.note === 'string' ? d.note.trim() : '';
    if (note.length > 400 || !SAFE.test(note)) throw bad('bad note');
    if (d.decision === 'reject' && note.length < 3) throw bad('a rejection needs a reason');
    const at = new Date(d.createdAt);
    if (typeof d.createdAt !== 'string' || Number.isNaN(at.getTime())) throw bad('bad createdAt');
    return { itemId: d.itemId, itemVersion: d.itemVersion, decision: d.decision, reviewerName: d.reviewerName.trim(), reviewerRole: d.reviewerRole, note, createdAt: at };
  });
}

function walk(dir, out = []) {
  let names = [];
  try {
    names = readdirSync(dir);
  } catch {
    return out;
  }
  for (const n of names) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (n.endsWith('.json')) out.push(p);
  }
  return out;
}

/** id → file path, for content/units and content/readings. */
export function indexContent(contentDir) {
  const map = new Map();
  for (const f of [...walk(join(contentDir, 'units')), ...walk(join(contentDir, 'readings'))]) {
    try {
      const j = JSON.parse(readFileSync(f, 'utf8'));
      if (typeof j.id === 'string') map.set(j.id, f);
    } catch {
      /* not a content file */
    }
  }
  return map;
}

const RANK = ['draft', 'agent_reviewed', 'reviewed', 'published'];

/** Returns the updated content object (religiousReview is carried over by reference, untouched). */
export function applyDecision(content, d) {
  const date = d.createdAt.toISOString().slice(0, 10);
  const review = { ...(content.review ?? { agentChecks: [] }) };
  review.reviewedBy = d.reviewerName;
  review.reviewerRole = d.reviewerRole;
  review.reviewedAt = date;
  review.reviewedVersion = d.itemVersion; // approval is tied to this exact version
  const next = { ...content, review };
  if (d.decision === 'approve') {
    delete review.rejectedReason;
    if (RANK.indexOf(content.reviewStatus) < RANK.indexOf('reviewed')) next.reviewStatus = 'reviewed';
  } else {
    review.rejectedReason = d.note;
  }
  return next;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  let decisions;
  try {
    decisions = validateExport(JSON.parse(readFileSync(args.file, 'utf8')));
  } catch (e) {
    console.error(`apply-reviews: ${e.message}`);
    process.exit(2);
  }
  // Latest decision per item wins.
  const latest = new Map();
  for (const d of [...decisions].sort((a, b) => a.createdAt - b.createdAt)) latest.set(d.itemId, d);
  const files = indexContent(args.contentDir);
  let refused = 0;
  let applied = 0;
  for (const d of latest.values()) {
    const file = files.get(d.itemId);
    if (!file) {
      console.error(`REFUSED ${d.itemId}: no content file under ${args.contentDir}`);
      refused++;
      continue;
    }
    const raw = readFileSync(file, 'utf8');
    const content = JSON.parse(raw);
    if (content.version !== d.itemVersion) {
      console.error(`REFUSED ${d.itemId}: reviewed v${d.itemVersion} but the file is v${content.version} — review it again`);
      refused++;
      continue;
    }
    const next = applyDecision(content, d);
    if (JSON.stringify(next.religiousReview) !== JSON.stringify(content.religiousReview)) throw new Error('internal: religiousReview changed');
    const rel = relative(process.cwd(), file);
    if (!args.dryRun) writeFileSync(file, `${JSON.stringify(next, null, 2)}${raw.endsWith('\n') ? '\n' : ''}`); // keep the file's own formatting
    applied++;
    const religious = content.framework === 'islamic' || (content.arabicPhrases ?? []).length > 0 || (content.crossCurricular ?? []).some((c) => c.subject === 'islamic_values');
    console.log(`${args.dryRun ? 'WOULD APPLY' : 'APPLIED'} ${d.decision} ${d.itemId} v${d.itemVersion} → ${rel}${religious ? ' (Islamic content: still needs a qualified scholar; religiousReview untouched)' : ''}`);
  }
  console.log(`${applied} applied, ${refused} refused${args.dryRun ? ' (dry run, nothing written)' : ''}.`);
  if (applied && !args.dryRun) console.log('Next: pnpm --filter @atlas/curriculum index && pnpm content:validate');
  process.exit(refused ? 1 : 0);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
