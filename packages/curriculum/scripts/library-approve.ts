/**
 * Record a HUMAN educational + link review for Reading Garden books, or a human review for Atlas passages.
 * The coding agent must never run this on the owner's behalf without the owner's explicit approval.
 *
 *   pnpm library:approve -- --reviewer "AB" --role parent --link-checked book-bookdash-egg passage-g1-rain-garden
 *   pnpm library:withdraw -- --reason "Provider withdrew the title" book-bookdash-egg
 *
 * --link-checked is required for books: it records that the reviewer opened the link and found the intended,
 * child-appropriate page. Rights are never changed here (title-level rights need evidence in the book file).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAW_BOOK_FILES } from '../src/content-index';

const args = process.argv.slice(2).filter((a) => a !== '--');
const flag = (n: string) => {
  const i = args.indexOf(n);
  return i >= 0 ? args.splice(i, 2)[1] : undefined;
};
const withdraw = process.env.LIBRARY_ACTION === 'withdraw';
const reason = flag('--reason');
const reviewer = flag('--reviewer');
const role = flag('--role');
const linkChecked = args.includes('--link-checked');
const ids = args.filter((a) => !a.startsWith('--'));
const root = join(import.meta.dirname, '../../../content');
const today = new Date().toISOString().slice(0, 10);

if (withdraw ? !reason : !reviewer || !role || !['parent', 'educator', 'librarian'].includes(role)) {
  console.error(withdraw ? 'Required: --reason "<why>" <book ids>' : 'Required: --reviewer <initials> --role parent|educator|librarian [--link-checked] <ids>');
  process.exit(2);
}
let changed = 0;
for (const id of ids) {
  if (id.startsWith('book-')) {
    const file = RAW_BOOK_FILES.find((f) => f.endsWith(`/${id}.json`));
    if (!file) { console.error(`${id}: not found`); continue; }
    const path = join(root, file);
    const b = JSON.parse(readFileSync(path, 'utf8'));
    if (withdraw) {
      b.publicationStatus = 'withdrawn';
      b.withdrawnReason = reason;
    } else {
      if (!linkChecked) { console.error(`${id}: open the link yourself, then pass --link-checked; skipped.`); continue; }
      b.educationalReview = { reviewedBy: reviewer, reviewerRole: role, reviewedAt: today, checklistVersion: 'rg-1' };
      b.linkReview = { checkedBy: reviewer, checkedAt: today };
      b.publicationStatus = 'published';
    }
    writeFileSync(path, JSON.stringify(b, null, 2) + '\n');
    changed++;
    console.log(`${withdraw ? 'Withdrawn' : 'Published'}: ${id}`);
  } else if (id.startsWith('passage-') && !withdraw) {
    const path = join(root, 'library/passages', `${id}.json`);
    const p = JSON.parse(readFileSync(path, 'utf8'));
    p.reviewStatus = 'reviewed';
    p.review = { ...p.review, reviewedBy: reviewer, reviewerRole: role === 'librarian' ? 'educator' : role, reviewedAt: today };
    writeFileSync(path, JSON.stringify(p, null, 2) + '\n');
    changed++;
    console.log(`Reviewed: ${id}`);
  } else console.error(`${id}: unsupported id; skipped.`);
}
console.log(`${changed} item(s) updated. Commit the change via PR.`);
