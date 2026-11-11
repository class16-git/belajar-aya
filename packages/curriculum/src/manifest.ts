import { createHash } from 'node:crypto';
import { getCatalog } from './catalog';
import { getLibrary, isBookVisible, isPassageVisible, libraryMinStatus } from './library';
import { isVisible } from './publication';
import type { ReviewStatus } from './schema';
import { getExpansion, isExpansionVisible } from './units';

/**
 * Release manifest (audit ATL-12): which content a given review threshold shows children, plus a SHA-256 digest of
 * that exact content. /api/health exposes it in production; `pnpm release:manifest` computes the same value from a
 * checkout, so the release record can tie a commit to the curriculum actually live.
 */
export function contentManifest(minReview: ReviewStatus) {
  const cat = getCatalog();
  const lib = getLibrary();
  const lessons = cat.lessons.filter((l) => isVisible(l, minReview));
  const books = lib.books.filter((b) => isBookVisible(b, lib.sources, libraryMinStatus(minReview)));
  const passages = lib.passages.filter((p) => isPassageVisible(p, minReview));
  const exp = getExpansion();
  const units = exp.units.filter((u) => isExpansionVisible(u, minReview));
  const readings = exp.readings.filter((r) => isExpansionVisible(r, minReview));
  const h = createHash('sha256');
  h.update(`curriculum:${cat.curriculumVersion}\n`);
  // Expansion items hash only when visible, so an empty set leaves earlier digests unchanged.
  for (const [kind, items] of [['lesson', lessons], ['book', books], ['passage', passages], ['unit', units], ['reading', readings]] as const) {
    for (const item of [...items].sort((a, b) => a.id.localeCompare(b.id))) h.update(`${kind}:${item.id}:${JSON.stringify(item)}\n`);
  }
  return {
    curriculumVersion: cat.curriculumVersion,
    minReview,
    contentDigest: h.digest('hex').slice(0, 16),
    visible: { lessons: lessons.length, books: books.length, passages: passages.length, units: units.length, readings: readings.length },
    ids: { lessons: lessons.map((l) => l.id).sort(), books: books.map((b) => b.id).sort(), passages: passages.map((p) => p.id).sort(), units: units.map((u) => u.id).sort(), readings: readings.map((r) => r.id).sort() },
  };
}
