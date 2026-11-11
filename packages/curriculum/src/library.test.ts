import { describe, expect, it } from 'vitest';
import { STAGES } from '@atlas/shared';
import { RAW_BOOKS, RAW_JOURNEYS, RAW_LIBRARY_SOURCES, RAW_PASSAGES } from './content-index';
import {
  bookIssues,
  choiceOrder,
  getLibrary,
  gradePassage,
  isBookVisible,
  isPassageVisible,
  libraryMinStatus,
  passageForClient,
  validateLibrary,
  type Book,
} from './library';

const lib = getLibrary();
const raw = () => ({ sources: structuredClone(RAW_LIBRARY_SOURCES), books: structuredClone(RAW_BOOKS), journeys: structuredClone(RAW_JOURNEYS), passages: structuredClone(RAW_PASSAGES) });
const firstBook = (): Book => structuredClone(lib.books[0]!);

describe('Reading Garden catalog (rights-aware, fail closed)', () => {
  it('loads: sources, 12 metadata-only books, a journey for every stage age 2 → Grade 6, original passages', () => {
    expect(lib.books.length).toBe(12);
    expect(lib.journeys.map((j) => j.stage).sort()).toEqual([...STAGES].sort());
    expect(lib.passages.length).toBeGreaterThanOrEqual(7);
  });

  it('every listed book comes from a source whose policy was verified, with evidence; unverified sources list no titles', () => {
    for (const b of lib.books) {
      const src = lib.sources.find((s) => s.id === b.sourceId)!;
      expect(src.verificationStatus, b.id).toBe('source_policy_verified');
      expect(src.evidence.length).toBeGreaterThan(0);
      expect(b.rights.evidence.some((e) => e.url === b.sourcePageUrl), `${b.id} title-page evidence`).toBe(true);
    }
    for (const s of lib.sources.filter((x) => x.verificationStatus !== 'source_policy_verified')) {
      expect(s.allowedHosts, s.id).toEqual([]);
      expect(lib.books.some((b) => b.sourceId === s.id), s.id).toBe(false);
    }
  });

  it('no rights are invented: nothing is hosted, embedded or marked title-confirmed without title-level evidence', () => {
    for (const b of lib.books) {
      expect(b.accessMode, b.id).toBe('external_link');
      expect(b.rights.hostingAllowed, b.id).toBe(false);
      expect(b.rights.titleLicenseConfirmed, b.id).toBe(false);
      expect(b.rights.status, b.id).toBe('SOURCE_OPEN_LICENSE_TITLE_UNCONFIRMED');
      expect(b.rights.attributionText).toContain('Book Dash');
    }
  });

  it('rejects hosting without verified title rights, embeds, off-domain links and URLs with query strings', () => {
    const hosted = firstBook();
    hosted.accessMode = 'atlas_hosted';
    hosted.rights.hostingAllowed = true;
    expect(bookIssues(hosted, lib.sources)).toEqual(expect.arrayContaining(['hosting is marked allowed but title-level rights are not verified', 'atlas_hosted needs verified title-level rights']));
    const embed = firstBook();
    embed.accessMode = 'provider_embed';
    expect(bookIssues(embed, lib.sources).join()).toMatch(/provider embeds are disabled/);
    const offsite = firstBook();
    offsite.sourcePageUrl = 'https://evil.example.com/books/x/';
    expect(bookIssues(offsite, lib.sources).join()).toMatch(/not an allowed host/);
    const r = raw();
    (r.books[0] as { sourcePageUrl: string }).sourcePageUrl = 'https://bookdash.org/books/x/?utm=1';
    expect(validateLibrary(r).errors.join()).toMatch(/query strings/);
    const http = raw();
    (http.books[0] as { sourcePageUrl: string }).sourcePageUrl = 'http://bookdash.org/books/x/';
    expect(validateLibrary(http).errors.join()).toMatch(/https/);
  });

  it('publication fails closed: production shows only published books with human educational AND link reviews', () => {
    expect(libraryMinStatus('reviewed')).toBe('published');
    expect(libraryMinStatus('agent_reviewed')).toBe('metadata_reviewed');
    const b = firstBook();
    // Start from an unreviewed copy: the shipped books carry the owner's review (2026-11-10).
    b.publicationStatus = 'metadata_reviewed';
    delete b.educationalReview;
    delete b.linkReview;
    expect(isBookVisible(b, lib.sources, 'published')).toBe(false);
    expect(isBookVisible(b, lib.sources, 'metadata_reviewed')).toBe(true);
    b.publicationStatus = 'published';
    expect(isBookVisible(b, lib.sources, 'published')).toBe(false); // no human records
    b.educationalReview = { reviewedBy: 'AB', reviewerRole: 'parent', reviewedAt: '2026-11-10', checklistVersion: 'rg-1' };
    expect(isBookVisible(b, lib.sources, 'published')).toBe(false); // still no link review
    b.linkReview = { checkedBy: 'AB', checkedAt: '2026-11-10' };
    expect(isBookVisible(b, lib.sources, 'published')).toBe(true);
    b.publicationStatus = 'withdrawn';
    b.withdrawnReason = 'Provider withdrew the title';
    expect(isBookVisible(b, lib.sources, 'metadata_reviewed')).toBe(false);
  });

  it('the agent cannot publish: published/educational_reviewed without a human record fails validation', () => {
    const r = raw();
    const raw0 = r.books[0] as { publicationStatus: string; educationalReview?: unknown };
    raw0.publicationStatus = 'published';
    delete raw0.educationalReview;
    expect(validateLibrary(r).errors.join()).toMatch(/needs a human educational review record/);
  });

  it('journeys separate listening from decoding; no-screen stages have no digital passages', () => {
    for (const j of lib.journeys) {
      expect(j.rubric.listening).toHaveLength(4);
      if (['age2_3', 'age3_4'].includes(j.stage)) expect(j.rubric.decoding).toBeNull();
      if (j.screen === 'none') expect(j.passageIds).toEqual([]);
    }
    expect(lib.journeys.find((j) => j.stage === 'age2_3')!.screen).toBe('none');
  });

  it('flags sensitive themes for parents (death, sibling conflict, disability representation)', () => {
    const themes = Object.fromEntries(lib.books.map((b) => [b.id, b.sensitiveThemes]));
    expect(themes['book-bookdash-circles']).toContain('death_and_life_cycles');
    expect(themes['book-bookdash-a-very-important-tree']).toContain('sibling_conflict');
    expect(themes['book-bookdash-i-can-do-it']).toContain('disability_representation');
  });
});

describe('Atlas-original comprehension passages', () => {
  it('are original, visible only with a human review record, and bilingual with matching structure', () => {
    for (const p of lib.passages) {
      expect(p.copyrightStatus).toBe('original');
      expect(p.paragraphs.en.length).toBe(p.paragraphs.id.length);
      expect(isPassageVisible(p, 'reviewed')).toBe((p.reviewStatus === 'reviewed' || p.reviewStatus === 'published') && !p.factChecks.some((f) => f.status === 'needs_source'));
    }
  });

  it('the client view never contains the answer key or evidence locations', () => {
    for (const p of lib.passages) {
      const json = JSON.stringify(passageForClient(p, 'en'));
      expect(json).not.toMatch(/"answer"|"evidenceParagraph"/);
    }
  });

  it('choices are shown in a fixed shuffled order, so the correct answer is not always first', () => {
    const positions = lib.passages.flatMap((p) => p.questions.map((q) => choiceOrder(p, q.id).indexOf(q.answer)));
    expect(new Set(positions).size).toBeGreaterThan(1);
    const share = positions.filter((x) => x === 0).length / positions.length;
    expect(share).toBeLessThan(0.7);
    for (const p of lib.passages) for (const q of p.questions) expect(choiceOrder(p, q.id)).toEqual(choiceOrder(p, q.id)); // stable
  });

  it('grades server-side by display position, in both languages', () => {
    for (const p of lib.passages) {
      const right = Object.fromEntries(p.questions.map((q) => [q.id, choiceOrder(p, q.id).indexOf(q.answer)]));
      expect(gradePassage(p, right).correct).toBe(p.questions.length);
      for (const loc of ['en', 'id'] as const) {
        const view = passageForClient(p, loc);
        for (const q of p.questions) expect(view.questions.find((x) => x.id === q.id)!.choices[right[q.id]!]).toBe(q.choices[loc][q.answer]);
      }
      const wrong = Object.fromEntries(p.questions.map((q) => [q.id, (right[q.id]! + 1) % q.choices.en.length]));
      expect(gradePassage(p, wrong).correct).toBe(0);
      expect(gradePassage(p, {}).correct).toBe(0);
    }
  });
});

describe('owner review (2026-11-10)', () => {
  it('every book is published with a human educational review and a recorded link check, but stays link-only', () => {
    for (const b of lib.books) {
      expect(b.publicationStatus, b.id).toBe('published');
      expect(b.educationalReview?.reviewedBy, b.id).toBe('owner');
      expect(b.linkReview?.checkedBy, b.id).toMatch(/owner-delegated/);
      expect(isBookVisible(b, lib.sources, 'published'), b.id).toBe(true);
      expect(b.accessMode).toBe('external_link');
      expect(b.rights.titleLicenseConfirmed).toBe(false); // approval never changes rights facts
    }
    // Owner approved all passages on 2026-11-11 (blanket approval). A claim that still needs a source keeps a
    // passage out of production regardless (the mangrove passage).
    for (const p of lib.passages) {
      expect(p.review.reviewedBy, p.id).toBe('owner');
      expect(isPassageVisible(p, 'reviewed'), p.id).toBe(!p.factChecks.some((f) => f.status === 'needs_source'));
    }
  });
});

describe('literacy content integrity (audit ATL-08, ATL-09)', () => {
  it('ATL-09: an "inference" answer is never stated verbatim in the passage', () => {
    for (const p of lib.passages) {
      for (const q of p.questions.filter((x) => x.kind === 'inference')) {
        for (const loc of ['en', 'id'] as const) {
          const answer = q.choices[loc][q.answer]!.toLowerCase().replace(/[.!?]$/, '');
          const text = p.paragraphs[loc].join(' ').toLowerCase();
          if (answer.split(/\s+/).length <= 2) expect(text, `${p.id}/${q.id} ${loc}`).not.toMatch(new RegExp(`\\b${answer}\\b`));
        }
      }
    }
  });
  it('ATL-08: passages that describe a study are labelled as invented examples in both languages and teach what to check', () => {
    for (const p of lib.passages.filter((x) => /study|research|team followed/i.test(x.paragraphs.en.join(' ')))) {
      expect(p.title.en.toLowerCase()).toContain('invented');
      expect(p.title.id.toLowerCase()).toContain('rekaan');
      expect(p.paragraphs.en[0]).toMatch(/made-up/);
      expect(p.paragraphs.id[0]).toMatch(/rekaan/);
      expect(p.paragraphs.en.join(' ')).toMatch(/does not prove/);
      expect(p.questions.some((q) => /check/i.test(q.prompt.en))).toBe(true);
    }
  });
});

describe('content pipeline: factual sourcing and near-duplicates', () => {
  it('every informational passage lists its factual claims; sourced claims carry an https source', () => {
    for (const p of lib.passages.filter((x) => x.genre === 'informational')) {
      expect(p.factChecks.length, p.id).toBeGreaterThan(0);
      for (const f of p.factChecks) if (f.status === 'sourced') expect(f.source?.url, p.id).toMatch(/^https:\/\//);
    }
    const r = raw();
    const info = r.passages.find((p) => (p as { genre: string }).genre === 'informational') as { factChecks?: unknown[] };
    delete info.factChecks;
    expect(validateLibrary(r).errors.join()).toMatch(/must list their factual claims/);
  });
  it('a claim that still needs a source keeps the passage out of production but visible for review', () => {
    const m = lib.passages.find((p) => p.id === 'passage-g4-mangroves')!;
    expect(m.factChecks.some((f) => f.status === 'needs_source')).toBe(true);
    expect(isPassageVisible(m, 'reviewed')).toBe(false);
    expect(isPassageVisible(m, 'agent_reviewed')).toBe(true);
  });
  it('rejects near-duplicate passages', () => {
    const r = raw();
    const copy = structuredClone(r.passages[0]) as { id: string };
    copy.id = 'passage-copy-of-first';
    r.passages.push(copy);
    expect(validateLibrary(r).errors.join()).toMatch(/near-duplicates/);
    expect(validateLibrary(raw()).errors).toEqual([]);
  });
});
