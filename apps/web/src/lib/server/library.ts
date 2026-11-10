import 'server-only';
import {
  getLibrary,
  isBookVisible,
  isPassageVisible,
  libraryMinStatus,
  type Book,
  type Journey,
  type Passage,
} from '@atlas/curriculum';
import { prisma, type ChildProfile } from '@atlas/database';
import { exactCalendarAge, STAGES, type Stage } from '@atlas/shared';
import { config } from './config';
import { HttpError } from './http';
import { isoFromDbDate } from './children';

/**
 * Reading Garden server helpers. Visibility is decided here, on the server, for every request: production shows
 * only human-published books and human-reviewed passages (fail closed); previews also show agent-checked ones.
 */
export function libraryView() {
  const lib = getLibrary();
  const min = libraryMinStatus(config.minReview);
  const books = lib.books.filter((b) => isBookVisible(b, lib.sources, min));
  const passages = lib.passages.filter((p) => isPassageVisible(p, config.minReview));
  return { lib, books, passages, journeys: lib.journeys, sources: lib.sources };
}

export function visibleBook(bookId: string): Book {
  const b = libraryView().books.find((x) => x.id === bookId);
  if (!b) throw new HttpError(404, 'NOT_FOUND');
  return b;
}

export function visiblePassage(passageId: string): Passage {
  const p = libraryView().passages.find((x) => x.id === passageId);
  if (!p) throw new HttpError(404, 'NOT_FOUND');
  return p;
}

const GRADE_STAGE: Record<string, Stage> = {
  Kindergarten: 'k',
  'Grade 1': 'g1',
  'Grade 2': 'g2',
  'Grade 3': 'g3',
  'Grade 4': 'g4',
  'Grade 5': 'g5',
  'Grade 6': 'g6',
};

/**
 * The reading journey stage for a learner. A parent-set school grade wins; otherwise the exact age in the learner's
 * timezone. Reading level is never inferred from performance here (no automatic promotion).
 */
export function readingStage(child: Pick<ChildProfile, 'schoolGrade' | 'dateOfBirth' | 'timezone'>, now = new Date()): Stage {
  if (child.schoolGrade && GRADE_STAGE[child.schoolGrade]) return GRADE_STAGE[child.schoolGrade]!;
  const dob = isoFromDbDate(child.dateOfBirth);
  if (!dob) return 'age2_3';
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: child.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const years = exactCalendarAge(dob, today).years;
  if (years < 3) return 'age2_3';
  if (years < 4) return 'age3_4';
  if (years < 5) return 'age4_5';
  if (years < 6) return 'k';
  return 'g1';
}

export function journeyFor(stage: Stage): Journey {
  return getLibrary().journeys.find((j) => j.stage === stage)!;
}

/** Books suitable for a stage, plus the neighbouring stages (reading level ≠ age). */
export function booksForStage(books: Book[], stage: Stage): Book[] {
  const i = STAGES.indexOf(stage);
  const near = new Set(STAGES.filter((_, j) => Math.abs(j - i) <= 1));
  const exact = books.filter((b) => b.stages.includes(stage));
  const nearby = books.filter((b) => !b.stages.includes(stage) && b.stages.some((s) => near.has(s)));
  return [...exact, ...nearby];
}

/** The child's parent-approved shelf: visible books the parent put ON_SHELF (hidden/withdrawn never appear). */
export async function childShelf(childId: string): Promise<Book[]> {
  const entries = await prisma.shelfEntry.findMany({ where: { childId, state: 'ON_SHELF' }, orderBy: { updatedAt: 'desc' } });
  const books = libraryView().books;
  return entries.map((e) => books.find((b) => b.id === e.bookId)).filter((b): b is Book => !!b);
}

/** Passages a child may read on screen: their stage's journey, only when that stage allows screen reading. */
export function passagesForChild(stage: Stage): Passage[] {
  const j = journeyFor(stage);
  if (j.screen === 'none') return [];
  const visible = libraryView().passages;
  return j.passageIds.map((id) => visible.find((p) => p.id === id)).filter((p): p is Passage => !!p);
}

export const sourceHost = (b: Book) => new URL(b.sourcePageUrl).hostname;

/** Parent-facing reading summary. Averages are over the last 10 rated events; decoding stays separate. */
export async function readingSummary(childId: string) {
  const events = await prisma.readingEvent.findMany({ where: { childId }, orderBy: { observedAt: 'desc' }, take: 100 });
  const avg = (xs: (number | null)[]) => {
    const v = xs.filter((x): x is number => x !== null).slice(0, 10);
    return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : null;
  };
  return {
    reads: events.filter((e) => e.kind !== 'COMPREHENSION_CHECK').length,
    checks: events.filter((e) => e.kind === 'COMPREHENSION_CHECK').length,
    listening: avg(events.map((e) => e.listening)),
    decoding: avg(events.map((e) => e.decoding)),
  };
}
