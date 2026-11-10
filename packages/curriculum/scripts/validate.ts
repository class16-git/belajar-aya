import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { RAW_LESSON_FILES, RAW_LESSONS, RAW_OBJECTIVE_FILES, RAW_OBJECTIVES, RAW_SKILLS } from '../src/content-index';
import { validateContent } from '../src/catalog';
import { isVisible } from '../src/publication';
import { getLibrary, isBookVisible, isPassageVisible } from '../src/library';

const contentRoot = join(import.meta.dirname, '../../../content');
const onDisk: string[] = [];
const objOnDisk: string[] = [];
const walk = (dir: string) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/^lesson-.*\.json$/.test(f)) onDisk.push(relative(contentRoot, p));
    else if (relative(contentRoot, dir) === 'objectives' && f.endsWith('.json')) objOnDisk.push(relative(contentRoot, p));
  }
};
walk(contentRoot);
const unindexed = [...onDisk.filter((f) => !RAW_LESSON_FILES.includes(f)), ...objOnDisk.filter((f) => !RAW_OBJECTIVE_FILES.includes(f))];

const result = validateContent(RAW_LESSONS, RAW_SKILLS, RAW_OBJECTIVES);
const errors = [...result.errors, ...unindexed.map((f) => `Not in content-index.ts (run pnpm --filter @atlas/curriculum index): ${f}`)];
if (errors.length) {
  console.error(`Content validation FAILED (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
const lessons = result.catalog!.lessons;
const count = (s: string) => lessons.filter((l) => l.reviewStatus === s).length;
console.log(
  `Content OK: ${result.catalog!.objectives.length} objectives, ${result.catalog!.skills.length} skills, ${lessons.length} lessons ` +
    `(draft ${count('draft')}, agent_reviewed ${count('agent_reviewed')}, reviewed ${count('reviewed')}, published ${count('published')}).`,
);
console.log(
  `Visible in production (min "reviewed"): ${lessons.filter((l) => isVisible(l, 'reviewed')).length}`,
);

// Reading Garden: throws (non-zero exit) on any invalid rights/publication data.
try {
  const lib = getLibrary();
  console.log(
    `Reading Garden OK: ${lib.sources.length} sources, ${lib.books.length} books, ${lib.journeys.length} journeys, ${lib.passages.length} passages. ` +
      `Visible in production: ${lib.books.filter((b) => isBookVisible(b, lib.sources, 'published')).length} books, ${lib.passages.filter((p) => isPassageVisible(p, 'reviewed')).length} passages.`,
  );
} catch (e) {
  console.error(String(e));
  process.exit(1);
}
