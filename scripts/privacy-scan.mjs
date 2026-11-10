#!/usr/bin/env node
/**
 * Privacy scan: fails if real learner data could be committed.
 * - No populated private config files may be tracked.
 * - If a local config/learners.private.json exists, none of its nicknames, DOBs or the parent
 *   email may appear in any tracked or staged file (legacy-site/ excluded: pre-existing public content).
 * Prints only counts and file paths — never the private values themselves.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' });
const tracked = git('ls-files', '--cached').split('\n').filter(Boolean);
let failures = 0;

const forbidden = tracked.filter((f) => /(^|\/)(learners\.private\.json|.*\.private\.json|\.env)$/.test(f) && !f.endsWith('.example.json'));
for (const f of forbidden) {
  console.error(`Tracked private file: ${f}`);
  failures++;
}

const privatePath = 'config/learners.private.json';
if (existsSync(privatePath)) {
  const cfg = JSON.parse(readFileSync(privatePath, 'utf8'));
  const needles = [
    ...(cfg.learners ?? []).flatMap((l) => [l.nickname, l.dateOfBirth]),
    cfg.parent?.email,
  ].filter((v) => typeof v === 'string' && v.length >= 3);
  const files = tracked.filter((f) => !f.startsWith('legacy-site/') && !/\.(png|jpg|jpeg|gif|webp|ico)$/.test(f));
  for (const f of files) {
    let text;
    try {
      text = readFileSync(f, 'utf8');
    } catch {
      continue;
    }
    needles.forEach((n, i) => {
      const re = new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (re.test(text)) {
        console.error(`Private value #${i + 1} found in tracked file: ${f}`);
        failures++;
      }
    });
  }
  console.log(`Checked ${files.length} tracked files against ${needles.length} private values.`);
} else {
  console.log('No local private config; checked tracked file names only.');
}

if (failures) {
  console.error(`Privacy scan FAILED (${failures}).`);
  process.exit(1);
}
console.log('Privacy scan passed.');
