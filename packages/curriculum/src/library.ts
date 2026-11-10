import { z } from 'zod';
import { mulberry32, shuffle, STAGES, type Stage } from '@atlas/shared';
import { RAW_BOOKS, RAW_JOURNEYS, RAW_LIBRARY_SOURCES, RAW_PASSAGES } from './content-index';
import { localized, REVIEW_STATUSES, type ReviewStatus } from './schema';

/**
 * Reading Garden catalog contract (Product Bible v3, ADR-0011).
 *
 * The catalog is version-controlled content, like lessons: every change is reviewable in git, nothing is seeded into
 * a production database as a build side effect, and publication fails closed in production.
 *
 * Rights are recorded per title with evidence. A source-level licence never substitutes for title-level evidence,
 * and anything not verified for hosting is link-only.
 */

const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const SAFE = /^[^<>]*$/;
const plain = (max: number) => z.string().trim().min(1).max(max).regex(SAFE, 'Markup is not allowed in content');
const httpsUrl = z
  .string()
  .url()
  .refine((u) => u.startsWith('https://'), 'Only https URLs are allowed')
  .refine((u) => !/[?#]/.test(u), 'Catalog URLs must not carry query strings or fragments (no tracking or injected parameters)');

// ── Sources ──────────────────────────────────────────────────────────────────────────────────────────────────────────
export const SOURCE_VERIFICATION = ['source_policy_verified', 'verification_required', 'unreachable'] as const;

export const evidenceSchema = z
  .object({
    url: httpsUrl,
    /** Short exact quote from the page, so a reviewer can re-check it. */
    quote: plain(400).optional(),
    checkedAt: DATE,
    checkedBy: z.enum(['agent', 'human']),
  })
  .strict();
export type Evidence = z.infer<typeof evidenceSchema>;

export const bookSourceSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9_]+$/),
    name: plain(120),
    canonicalUrl: httpsUrl.nullable(),
    /** Exact hostnames that catalog links for this source may point to. */
    allowedHosts: z.array(z.string().regex(/^[a-z0-9.-]+$/)),
    purpose: plain(200),
    verificationStatus: z.enum(SOURCE_VERIFICATION),
    /** Licence the source states for its catalogue as a whole (never enough on its own for a title). */
    sourceLicense: z.string().max(40).nullable(),
    evidence: z.array(evidenceSchema),
    notes: plain(600).optional(),
  })
  .strict();
export type BookSource = z.infer<typeof bookSourceSchema>;

// ── Books ────────────────────────────────────────────────────────────────────────────────────────────────────────────
/** Book Dash style: the source states an open licence, but the title page itself does not show one. */
export const RIGHTS_STATUSES = [
  'UNKNOWN',
  'SOURCE_OPEN_LICENSE_TITLE_UNCONFIRMED',
  'READ_ONLY',
  'OPEN_LICENSE_VERIFIED',
  'DIRECT_PERMISSION',
  'PUBLIC_DOMAIN_VERIFIED',
] as const;
export type RightsStatus = (typeof RIGHTS_STATUSES)[number];
const HOSTABLE: RightsStatus[] = ['OPEN_LICENSE_VERIFIED', 'DIRECT_PERMISSION', 'PUBLIC_DOMAIN_VERIFIED'];

export const ACCESS_MODES = ['external_link', 'provider_embed', 'atlas_hosted'] as const;
export const LIBRARY_STATUSES = ['discovered', 'rights_pending', 'metadata_reviewed', 'educational_reviewed', 'published', 'withdrawn'] as const;
export type LibraryStatus = (typeof LIBRARY_STATUSES)[number];
export const BOOK_ROLES = ['read_aloud', 'shared_reading', 'independent_reading'] as const;
export const BOOK_TOPICS = ['animals', 'nature', 'family', 'feelings', 'daily_life', 'adventure', 'food', 'inclusion', 'science'] as const;
/** Themes a parent should know about before reading (shown on the book page, never hidden). */
export const SENSITIVE_THEMES = ['death_and_life_cycles', 'sibling_conflict', 'separation', 'disability_representation'] as const;
export const CREATOR_ROLES = ['writer', 'illustrator', 'designer', 'editor', 'translator'] as const;

const humanReview = z
  .object({
    reviewedBy: plain(80),
    reviewerRole: z.enum(['parent', 'educator', 'librarian']),
    reviewedAt: DATE,
    checklistVersion: z.string().max(20),
  })
  .strict();

export const bookSchema = z
  .object({
    id: z.string().regex(/^book-[a-z0-9-]+$/),
    sourceId: z.string(),
    title: plain(160),
    creators: z.array(z.object({ name: plain(120), role: z.enum(CREATOR_ROLES) }).strict()).min(1),
    /** ISO 639-1 language of the edition we link to. */
    language: z.string().regex(/^[a-z]{2}$/),
    /** Other editions as the source lists them (names only; not verified individually). */
    otherLanguagesListed: z.array(plain(60)).default([]),
    isbn: z.string().regex(/^[0-9-]{10,17}$/).optional(),
    /** Atlas's own short description, never the publisher's text. */
    synopsis: localized,
    sourcePageUrl: httpsUrl,
    accessMode: z.enum(ACCESS_MODES),
    rights: z
      .object({
        status: z.enum(RIGHTS_STATUSES),
        /** Licence stated by the source for its catalogue (not title-level evidence). */
        sourceLicense: z.string().max(40).nullable(),
        licenseUrl: httpsUrl.nullable(),
        /** True only when the title page/imprint itself was read and shows the licence. */
        titleLicenseConfirmed: z.boolean(),
        attributionText: plain(400),
        hostingAllowed: z.boolean(),
        adaptationAllowed: z.boolean().nullable(),
        narrationAllowed: z.boolean().nullable(),
        evidence: z.array(evidenceSchema).min(1),
      })
      .strict(),
    stages: z.array(z.enum(STAGES)).min(1),
    role: z.enum(BOOK_ROLES),
    topics: z.array(z.enum(BOOK_TOPICS)).min(1),
    sensitiveThemes: z.array(z.enum(SENSITIVE_THEMES)).default([]),
    /** Reading strands this book is good for (READING_SCOPE_SEQUENCE.md). */
    strands: z.array(z.enum(['oral_language', 'phonological', 'vocabulary', 'comprehension', 'habits'])).min(1),
    prompts: z.object({ before: z.array(localized).min(1), during: z.array(localized).min(1), after: z.array(localized).min(1) }).strict(),
    extensions: z
      .object({
        montessori: localized,
        maths: localized.optional(),
        stem: localized.optional(),
      })
      .strict(),
    publicationStatus: z.enum(LIBRARY_STATUSES),
    agentChecks: z.array(z.string()).default([]),
    educationalReview: humanReview.optional(),
    /** Human check that the link opens the intended, child-appropriate page. */
    linkReview: z.object({ checkedBy: plain(80), checkedAt: DATE }).strict().optional(),
    withdrawnReason: plain(200).optional(),
  })
  .strict();
export type Book = z.infer<typeof bookSchema>;

// ── Reading journeys (one per stage) ─────────────────────────────────────────────────────────────────────────────────
export const STRANDS = ['oral_language', 'phonological', 'vocabulary', 'comprehension', 'habits'] as const;
export type Strand = (typeof STRANDS)[number];

export const journeySchema = z
  .object({
    stage: z.enum(STAGES),
    title: localized,
    experience: localized,
    /** Screen use for this stage: none (parent-operated only), shared (with an adult) or independent. */
    screen: z.enum(['none', 'shared', 'independent']),
    strands: z.object(Object.fromEntries(STRANDS.map((s) => [s, localized])) as Record<Strand, typeof localized>).strict(),
    routines: z.array(z.object({ title: localized, steps: z.array(localized).min(2) }).strict()).min(2).max(3),
    anyBookPrompts: z.object({ before: z.array(localized).min(1), during: z.array(localized).min(1), after: z.array(localized).min(1) }).strict(),
    /** Descriptors 0..3. Listening and decoding are separate (decoding is null before letters are taught). */
    rubric: z
      .object({
        listening: z.array(localized).length(4),
        decoding: z.array(localized).length(4).nullable(),
      })
      .strict(),
    passageIds: z.array(z.string()).default([]),
  })
  .strict();
export type Journey = z.infer<typeof journeySchema>;
export const journeysFileSchema = z.object({ version: z.string(), journeys: z.array(journeySchema) }).strict();

// ── Atlas-original passages (rights-clean digital comprehension) ─────────────────────────────────────────────────────
export const QUESTION_KINDS = ['literal', 'sequence', 'vocabulary', 'inference', 'main_idea', 'evidence'] as const;
export const passageSchema = z
  .object({
    id: z.string().regex(/^passage-[a-z0-9-]+$/),
    stage: z.enum(STAGES),
    title: localized,
    genre: z.enum(['narrative', 'informational']),
    paragraphs: z.object({ en: z.array(plain(700)).min(2), id: z.array(plain(700)).min(2) }).strict(),
    questions: z
      .array(
        z
          .object({
            id: z.string().regex(/^q[0-9]+$/),
            kind: z.enum(QUESTION_KINDS),
            prompt: localized,
            choices: z.object({ en: z.array(plain(200)).min(2).max(4), id: z.array(plain(200)).min(2).max(4) }).strict(),
            /** Index of the correct choice. Server-side only; never sent before an answer. */
            answer: z.number().int().min(0).max(3),
            /** Paragraph (0-based) that holds the evidence, shown after answering. */
            evidenceParagraph: z.number().int().min(0),
          })
          .strict(),
      )
      .min(2)
      .max(5),
    copyrightStatus: z.literal('original'),
    /**
     * Factual sourcing (expansion pipeline). Every informational passage lists its factual claims:
     * common_knowledge (general school science a reviewer can check), sourced (with a verified source),
     * invented_example (an invented scenario, not presented as real-world fact) or needs_source (blocks production until sourced).
     * Sources are never invented: a claim the agent could not verify stays needs_source.
     */
    factChecks: z
      .array(
        z
          .object({
            claim: plain(300),
            status: z.enum(['common_knowledge', 'sourced', 'invented_example', 'needs_source']),
            source: z.object({ title: plain(200), url: z.string().url().startsWith('https://') }).strict().optional(),
          })
          .strict(),
      )
      .default([]),
    reviewStatus: z.enum(REVIEW_STATUSES),
    review: z
      .object({
        agentChecks: z.array(z.string()).default([]),
        reviewedBy: plain(80).optional(),
        reviewerRole: z.enum(['parent', 'educator']).optional(),
        reviewedAt: DATE.optional(),
      })
      .strict(),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (p.paragraphs.en.length !== p.paragraphs.id.length) ctx.addIssue({ code: 'custom', message: `${p.id}: EN and ID must have the same paragraphs` });
    for (const q of p.questions) {
      if (q.choices.en.length !== q.choices.id.length) ctx.addIssue({ code: 'custom', message: `${p.id}/${q.id}: choice count differs by language` });
      if (q.answer >= q.choices.en.length) ctx.addIssue({ code: 'custom', message: `${p.id}/${q.id}: answer out of range` });
      if (q.evidenceParagraph >= p.paragraphs.en.length) ctx.addIssue({ code: 'custom', message: `${p.id}/${q.id}: evidence paragraph out of range` });
    }
    if (p.genre === 'informational' && p.factChecks.length === 0) ctx.addIssue({ code: 'custom', message: `${p.id}: informational passages must list their factual claims (factChecks)` });
    for (const f of p.factChecks) {
      if (f.status === 'sourced' && !f.source) ctx.addIssue({ code: 'custom', message: `${p.id}: a "sourced" claim needs its source` });
      if (f.status !== 'sourced' && f.source) ctx.addIssue({ code: 'custom', message: `${p.id}: only "sourced" claims carry a source` });
    }
  });
export type Passage = z.infer<typeof passageSchema>;

// ── Validation and publication gate ──────────────────────────────────────────────────────────────────────────────────
export interface Library {
  sources: BookSource[];
  books: Book[];
  journeys: Journey[];
  passages: Passage[];
}

/** Everything that blocks a book from being shown in production (fail closed). */
export function bookIssues(b: Book, sources: BookSource[]): string[] {
  const issues: string[] = [];
  const src = sources.find((s) => s.id === b.sourceId);
  if (!src) issues.push(`unknown source ${b.sourceId}`);
  else {
    const host = new URL(b.sourcePageUrl).hostname;
    if (!src.allowedHosts.includes(host)) issues.push(`link host ${host} is not an allowed host for ${src.id}`);
  }
  const hostable = HOSTABLE.includes(b.rights.status) && b.rights.titleLicenseConfirmed;
  if (b.rights.hostingAllowed && !hostable) issues.push('hosting is marked allowed but title-level rights are not verified');
  if (b.accessMode === 'atlas_hosted' && !(hostable && b.rights.hostingAllowed)) issues.push('atlas_hosted needs verified title-level rights');
  if (b.accessMode === 'provider_embed') issues.push('provider embeds are disabled until a provider permission and security review exist (ADR-0011)');
  if (b.rights.titleLicenseConfirmed && !b.rights.evidence.some((e) => e.url === b.sourcePageUrl || e.url.startsWith(b.sourcePageUrl)))
    issues.push('title licence marked confirmed without title-page evidence');
  if (b.publicationStatus === 'published') {
    if (!b.educationalReview) issues.push('published without a human educational review');
    if (!b.linkReview) issues.push('published without a human link review');
  }
  if (b.publicationStatus === 'withdrawn' && !b.withdrawnReason) issues.push('withdrawn without a reason');
  return issues;
}

/**
 * Minimum library status shown. Production shows only `published` (human-reviewed); previews also show
 * `metadata_reviewed` and `educational_reviewed` so reviewers can see them. `withdrawn` is never shown.
 */
export function libraryMinStatus(minReview: ReviewStatus): LibraryStatus {
  return minReview === 'reviewed' || minReview === 'published' ? 'published' : 'metadata_reviewed';
}
const STATUS_RANK: Record<LibraryStatus, number> = { discovered: 0, rights_pending: 1, metadata_reviewed: 2, educational_reviewed: 3, published: 4, withdrawn: -1 };
export function isBookVisible(b: Book, sources: BookSource[], min: LibraryStatus): boolean {
  if (b.publicationStatus === 'withdrawn') return false;
  if (STATUS_RANK[b.publicationStatus] < STATUS_RANK[min]) return false;
  // In production every issue blocks; in previews only safety/rights issues block (reviews are what previews are for).
  const issues = bookIssues(b, sources).filter((i) => min === 'published' || !i.startsWith('published without'));
  return issues.length === 0;
}
export function isPassageVisible(p: Passage, minReview: ReviewStatus): boolean {
  const rank = (s: ReviewStatus) => REVIEW_STATUSES.indexOf(s);
  if (rank(p.reviewStatus) < rank(minReview)) return false;
  if ((p.reviewStatus === 'reviewed' || p.reviewStatus === 'published') && !(p.review.reviewedBy && p.review.reviewedAt)) return false;
  // Unresolved factual claims never reach production (preview still shows them for review).
  if (rank(minReview) >= rank('reviewed') && p.factChecks.some((f) => f.status === 'needs_source')) return false;
  return true;
}

/** Word 3-gram Jaccard similarity of two texts (near-duplicate detection). */
export function textSimilarity(a: string, b: string): number {
  const grams = (t: string) => {
    const w = t.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
    const g = new Set<string>();
    for (let i = 0; i + 2 < w.length; i++) g.add(`${w[i]} ${w[i + 1]} ${w[i + 2]}`);
    return g;
  };
  const x = grams(a);
  const y = grams(b);
  if (x.size === 0 || y.size === 0) return 0;
  let inter = 0;
  for (const g of x) if (y.has(g)) inter++;
  return inter / (x.size + y.size - inter);
}
export const NEAR_DUPLICATE_THRESHOLD = 0.35;

export function validateLibrary(raw: { sources: unknown; books: unknown[]; journeys: unknown; passages: unknown[] }): { library: Library; errors: string[] } {
  const errors: string[] = [];
  const sources = z.object({ sources: z.array(bookSourceSchema) }).strict().safeParse(raw.sources);
  if (!sources.success) errors.push(`sources: ${sources.error.message}`);
  const books: Book[] = [];
  for (const b of raw.books) {
    const r = bookSchema.safeParse(b);
    if (r.success) books.push(r.data);
    else errors.push(`book ${(b as { id?: string })?.id ?? '?'}: ${r.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
  }
  const journeys = journeysFileSchema.safeParse(raw.journeys);
  if (!journeys.success) errors.push(`journeys: ${journeys.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
  const passages: Passage[] = [];
  for (const p of raw.passages) {
    const r = passageSchema.safeParse(p);
    if (r.success) passages.push(r.data);
    else errors.push(`passage ${(p as { id?: string })?.id ?? '?'}: ${r.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
  }
  const lib: Library = { sources: sources.success ? sources.data.sources : [], books, journeys: journeys.success ? journeys.data.journeys : [], passages };
  const dup = <T extends { id: string }>(xs: T[], label: string) => {
    const seen = new Set<string>();
    for (const x of xs) {
      if (seen.has(x.id)) errors.push(`duplicate ${label} id ${x.id}`);
      seen.add(x.id);
    }
  };
  dup(lib.sources, 'source');
  dup(lib.books, 'book');
  dup(lib.passages, 'passage');
  for (let i = 0; i < lib.passages.length; i++)
    for (let j = i + 1; j < lib.passages.length; j++) {
      const [a, b] = [lib.passages[i]!, lib.passages[j]!];
      const sim = textSimilarity(a.paragraphs.en.join(' '), b.paragraphs.en.join(' '));
      if (sim >= NEAR_DUPLICATE_THRESHOLD) errors.push(`passages ${a.id} and ${b.id} are near-duplicates (similarity ${sim.toFixed(2)})`);
    }
  for (const b of lib.books) for (const i of bookIssues(b, lib.sources)) if (!i.startsWith('published without') || b.publicationStatus === 'published') errors.push(`book ${b.id}: ${i}`);
  // The agent may prepare metadata; it can never record an educational/link review or publish.
  for (const b of lib.books) {
    if ((b.publicationStatus === 'educational_reviewed' || b.publicationStatus === 'published') && !b.educationalReview) errors.push(`book ${b.id}: ${b.publicationStatus} needs a human educational review record`);
  }
  const stagesSeen = new Set(lib.journeys.map((j) => j.stage));
  for (const s of STAGES) if (!stagesSeen.has(s)) errors.push(`journeys: missing stage ${s}`);
  for (const j of lib.journeys) {
    for (const pid of j.passageIds) {
      const p = lib.passages.find((x) => x.id === pid);
      if (!p) errors.push(`journey ${j.stage}: unknown passage ${pid}`);
      else if (p.stage !== j.stage) errors.push(`journey ${j.stage}: passage ${pid} is for ${p.stage}`);
    }
    if (j.screen === 'none' && j.passageIds.length) errors.push(`journey ${j.stage}: no-screen stage cannot have digital passages`);
  }
  for (const p of lib.passages) {
    if ((p.reviewStatus === 'reviewed' || p.reviewStatus === 'published') && !(p.review.reviewedBy && p.review.reviewedAt)) errors.push(`passage ${p.id}: ${p.reviewStatus} needs a human review record`);
  }
  return { library: lib, errors };
}

/** Stable 32-bit hash of a string (FNV-1a), used to seed the display order of choices. */
function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Display order of a question's choices: a fixed shuffle per question, so the correct answer is not always in the
 * authored position and the client never learns original indices (it answers by display position).
 */
export function choiceOrder(p: Passage, qid: string): number[] {
  const q = p.questions.find((x) => x.id === qid);
  if (!q) return [];
  return shuffle(mulberry32(hash(`${p.id}/${q.id}`)), q.choices.en.map((_, i) => i));
}

/** Client-safe view of a passage: no answer key, no evidence locations, choices in display order. */
export function passageForClient(p: Passage, locale: 'en' | 'id') {
  return {
    id: p.id,
    stage: p.stage as Stage,
    title: p.title[locale],
    genre: p.genre,
    paragraphs: p.paragraphs[locale],
    questions: p.questions.map((q) => ({ id: q.id, kind: q.kind, prompt: q.prompt[locale], choices: choiceOrder(p, q.id).map((i) => q.choices[locale][i]!) })),
  };
}

/**
 * Server-side grading (never trust a client "correct" flag). `answers` maps question id → display position.
 * Returns, after answering only, whether each was right and which paragraph holds the evidence.
 */
export function gradePassage(p: Passage, answers: Record<string, number>) {
  const results = p.questions.map((q) => {
    const pos = answers[q.id];
    const original = pos === undefined ? -1 : (choiceOrder(p, q.id)[pos] ?? -1);
    return { id: q.id, kind: q.kind, correct: original === q.answer, evidenceParagraph: q.evidenceParagraph };
  });
  return { results, correct: results.filter((r) => r.correct).length, total: results.length };
}

// ── Loader ───────────────────────────────────────────────────────────────────────────────────────────────────────────
let cachedLibrary: Library | null = null;
/** The validated library. Invalid content fails loudly (build/CI), never silently shows partial rights data. */
export function getLibrary(raw?: { sources: unknown; books: unknown[]; journeys: unknown; passages: unknown[] }): Library {
  if (!raw && cachedLibrary) return cachedLibrary;
  const { library, errors } = validateLibrary(raw ?? { sources: RAW_LIBRARY_SOURCES, books: RAW_BOOKS, journeys: RAW_JOURNEYS, passages: RAW_PASSAGES });
  if (errors.length) throw new Error(`Invalid Reading Garden content:\n${errors.join('\n')}`);
  if (!raw) cachedLibrary = library;
  return library;
}
