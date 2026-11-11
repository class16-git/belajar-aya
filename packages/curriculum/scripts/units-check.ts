/**
 * Validate expansion content straight from disk (no index needed), so authoring agents can check their own files.
 *   pnpm --filter @atlas/curriculum units:check                 → everything
 *   pnpm --filter @atlas/curriculum units:check -- content/units/g3/math   → only errors mentioning files under that path
 * Exit code 1 when any (filtered) error remains. Cross-file checks (prerequisites, cycles, near-duplicates) always use
 * the whole corpus.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { validateExpansion } from '../src/units';

const repo = join(import.meta.dirname, '../../..');
const files: string[] = [];
const walk = (d: string) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/^(unit|reading)-.*\.json$/.test(f)) files.push(p);
  }
};
for (const d of ['content/units', 'content/readings']) {
  try { walk(join(repo, d)); } catch { /* missing dir */ }
}
const units: unknown[] = [];
const readings: unknown[] = [];
const idToFile = new Map<string, string>();
const parseErrors: string[] = [];
for (const f of files) {
  try {
    const j = JSON.parse(readFileSync(f, 'utf8')) as { id?: string };
    idToFile.set(j.id ?? f, relative(repo, f));
    if (f.split('/').pop()!.replace(/\.json$/, '') !== j.id) parseErrors.push(`${relative(repo, f)}: file name must equal the id (${j.id})`);
    (f.includes('/units/') ? units : readings).push(j);
  } catch (e) {
    parseErrors.push(`${relative(repo, f)}: invalid JSON (${(e as Error).message})`);
  }
}
const { content, errors } = validateExpansion({ units, readings });
const filters = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const all = [...parseErrors, ...errors];
const shown = filters.length ? all.filter((e) => [...idToFile].some(([id, f]) => e.includes(id) && filters.some((p) => f.startsWith(p))) || filters.some((p) => e.includes(p))) : all;
for (const e of shown) console.error(`✗ ${e}`);
console.log(`${content.units.length} units and ${content.readings.length} readings parsed; ${all.length} errors in total, ${shown.length} shown.`);
process.exit(shown.length ? 1 : 0);
