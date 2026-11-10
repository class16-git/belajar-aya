/**
 * Record a HUMAN review of lessons. The coding agent must never run this on the owner's behalf.
 * Usage: pnpm content:approve --reviewer "Initials" --role parent lesson-tod-match-001 [...]
 *        pnpm content:approve --reviewer "Initials" --role educator --all-agent-reviewed
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAW_LESSON_FILES } from '../src/content-index';

const args = process.argv.slice(2);
const flag = (n: string) => {
  const i = args.indexOf(n);
  return i >= 0 ? args.splice(i, 2)[1] : undefined;
};
const reviewer = flag('--reviewer');
const role = flag('--role');
const all = args.includes('--all-agent-reviewed');
const ids = args.filter((a) => !a.startsWith('--'));
if (!reviewer || !role || !['parent', 'educator', 'curriculum_reviewer'].includes(role)) {
  console.error('Required: --reviewer <name or initials> --role parent|educator|curriculum_reviewer');
  process.exit(2);
}
const today = new Date().toISOString().slice(0, 10);
const isReligious = (l: { domain?: string; framework?: string; arabicPhrases?: unknown[]; reviewFlags?: string[] }) =>
  l.domain === 'islamic_studies' || l.framework === 'islamic_studies' || (l.arabicPhrases?.length ?? 0) > 0 || (l.reviewFlags ?? []).includes('religious_content');
const root = join(import.meta.dirname, '../../../content');
let changed = 0;
for (const f of RAW_LESSON_FILES) {
  const path = join(root, f);
  const lesson = JSON.parse(readFileSync(path, 'utf8'));
  const selected = all ? lesson.reviewStatus === 'agent_reviewed' : ids.includes(lesson.id);
  if (!selected) continue;
  if (lesson.reviewStatus === 'draft' && !isReligious(lesson)) {
    console.error(`${lesson.id}: draft content must be completed by an author first; skipped.`);
    continue;
  }
  if (isReligious(lesson) && lesson.religiousReview?.approvalStatus !== 'approved') {
    console.error(`${lesson.id}: religious content needs qualified religious approval first (pnpm content:religious-approve); skipped.`);
    continue;
  }
  lesson.reviewStatus = 'reviewed';
  lesson.review = { ...lesson.review, reviewedBy: reviewer, reviewerRole: role, reviewedAt: today };
  writeFileSync(path, JSON.stringify(lesson, null, 2) + '\n');
  changed++;
  console.log(`Reviewed: ${lesson.id}`);
}
console.log(`${changed} lesson(s) marked reviewed by ${reviewer} (${role}). Commit the change via PR.`);
