/** Writes docs/curriculum/COVERAGE_REPORT.md. With --check, fails if the committed report is stale. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { getCatalog } from '../src/catalog';
import { coverageReportMarkdown } from '../src/coverage';

const out = join(import.meta.dirname, '../../../docs/curriculum/COVERAGE_REPORT.md');
const md = coverageReportMarkdown(getCatalog()) + '\n';
if (process.argv.includes('--check')) {
  if (!existsSync(out) || readFileSync(out, 'utf8') !== md) {
    console.error('docs/curriculum/COVERAGE_REPORT.md is stale. Run: pnpm curriculum:coverage');
    process.exit(1);
  }
  console.log('Coverage report is up to date.');
} else {
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, md);
  console.log(`Wrote ${out}`);
}
