/** Writes docs/delivery/CONTENT_DASHBOARD.md. With --check, fails if the committed dashboard is stale. */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCatalog } from '../src/catalog';
import { contentDashboardMarkdown, expansionDashboard, expansionDashboardMarkdown } from '../src/dashboard';
import { expansionSummary } from '../src/expansion-store';
import { getLibrary } from '../src/library';

const out = join(import.meta.dirname, '../../../docs/delivery/CONTENT_DASHBOARD.md');
const exp = expansionSummary();
const md = contentDashboardMarkdown(getCatalog(), getLibrary()) + expansionDashboardMarkdown(exp);
const jsonOut = join(import.meta.dirname, '../../../docs/delivery/content-dashboard.json');
const json = JSON.stringify(expansionDashboard(exp), null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (!existsSync(out) || readFileSync(out, 'utf8') !== md || !existsSync(jsonOut) || readFileSync(jsonOut, 'utf8') !== json) {
    console.error('docs/delivery/CONTENT_DASHBOARD.md is stale. Run: pnpm content:dashboard');
    process.exit(1);
  }
  console.log('Content dashboard is up to date.');
} else {
  writeFileSync(out, md);
  writeFileSync(jsonOut, json);
  console.log(`Wrote ${out}`);
}
