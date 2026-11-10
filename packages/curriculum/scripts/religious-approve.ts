/**
 * Records a QUALIFIED HUMAN religious review (scholar + translation reviewer) for Islamic-studies lessons.
 * The coding agent must never run this. Citations must come from the reviewer, never be invented.
 *
 * pnpm content:religious-approve --scholar "<initials>" --translator "<initials>" \
 *   --school "<doctrinal school>" --fiqh "<madhhab or none>" --source "<Arabic source title>" \
 *   --edition "<edition>" --section "<page/section>" <lesson-id> [...]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAW_LESSON_FILES } from '../src/content-index';

const args = process.argv.slice(2);
const flag = (n: string) => {
  const i = args.indexOf(n);
  return i >= 0 ? args.splice(i, 2)[1] : undefined;
};
const scholar = flag('--scholar');
const translator = flag('--translator');
const school = flag('--school');
const fiqh = flag('--fiqh');
const source = flag('--source');
const edition = flag('--edition');
const section = flag('--section');
const ids = args.filter((a) => !a.startsWith('--'));
if (!scholar || !school || ids.length === 0) {
  console.error('Required: --scholar <initials> --school <doctrinal school> <lesson-id>... (and --translator for Arabic text)');
  process.exit(2);
}
const today = new Date().toISOString().slice(0, 10);
const root = join(import.meta.dirname, '../../../content');
let changed = 0;
for (const f of RAW_LESSON_FILES) {
  const path = join(root, f);
  const lesson = JSON.parse(readFileSync(path, 'utf8'));
  if (!ids.includes(lesson.id)) continue;
  const hasArabic = (lesson.arabicPhrases ?? []).length > 0;
  if (hasArabic && !translator) {
    console.error(`${lesson.id}: contains Arabic text — --translator is required; skipped.`);
    continue;
  }
  lesson.religiousReview = {
    doctrinalSchool: school,
    fiqhSchool: fiqh ?? null,
    arabicSource: source ?? null,
    edition: edition ?? null,
    pageOrSection: section ?? null,
    translationReviewer: translator ?? null,
    scholarReviewer: scholar,
    reviewedAt: today,
    approvalStatus: 'approved',
    notes: lesson.religiousReview?.notes ?? [],
  };
  lesson.arabicPhrases = (lesson.arabicPhrases ?? []).map((p: object) => ({ ...p, verified: true }));
  writeFileSync(path, JSON.stringify(lesson, null, 2) + '\n');
  changed++;
  console.log(`Religious review recorded: ${lesson.id}`);
}
console.log(`${changed} lesson(s) religiously approved by ${scholar}. Content review (content:approve) is still required. Commit via PR.`);
