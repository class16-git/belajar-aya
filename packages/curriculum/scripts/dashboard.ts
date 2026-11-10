/** Writes docs/delivery/CONTENT_DASHBOARD.md. With --check, fails if the committed dashboard is stale. */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCatalog } from '../src/catalog';
import { contentDashboardMarkdown } from '../src/dashboard';
import { getLibrary } from '../src/library';

const out = join(import.meta.dirname, '../../../docs/delivery/CONTENT_DASHBOARD.md');
const md = contentDashboardMarkdown(getCatalog(), getLibrary());
if (process.argv.includes('--check')) {
  if (!existsSync(out) || readFileSync(out, 'utf8') !== md) {
    console.error('docs/delivery/CONTENT_DASHBOARD.md is stale. Run: pnpm content:dashboard');
    process.exit(1);
  }
  console.log('Content dashboard is up to date.');
} else {
  writeFileSync(out, md);
  console.log(`Wrote ${out}`);
}
