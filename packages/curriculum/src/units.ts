import { z } from 'zod';
import { STAGES, type Stage } from '@atlas/shared';
import { arabicPhraseSchema, localized, REVIEW_STATUSES, religiousReviewSchema, type ReviewStatus } from './schema';
import { HAZARD_KEYWORDS } from './schema';
import { textSimilarity } from './library';

/**
 * Expansion content contract (2026-11): complete LEARNING UNITS and ORIGINAL READING MATERIALS.
 *
 * Files: content/units/<level>/<framework>/unit-*.json and content/readings/<level>/reading-*.json.
 * Generated content starts as `draft` or `agent_reviewed` and is never visible in production until a person records a
 * review (and, for Islamic content, a qualified scholar approves it). Pipeline state (planned → drafted →
 * structurally validated → subject validated → human reviewed → published → browser verified) is computed by
 * `pipelineState`, never hand-set.
 */

const SAFE = /^[^<>]*$/;
const plain = (max: number) => z.string().trim().min(1).max(max).regex(SAFE, 'Markup is not allowed in content');
const loc = localized;
const locList = (min: number) => z.array(loc).min(min);
const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const SEMVER = z.string().regex(/^\d+\.\d+\.\d+$/);

export const UNIT_FRAMEWORKS = ['montessori', 'math', 'stem', 'islamic', 'literacy'] as const;
export type UnitFramework = (typeof UNIT_FRAMEWORKS)[number];

/** Strands per framework; a unit's strand must belong to its framework. */
export const UNIT_STRANDS: Record<UnitFramework, readonly string[]> = {
  montessori: ['practical_life', 'sensorial', 'language', 'mathematics', 'cultural', 'geography', 'botany', 'zoology', 'history', 'cosmic_education', 'independence'],
  math: ['number_sense', 'addition_subtraction', 'multiplication_division', 'place_value', 'fractions', 'decimals', 'geometry', 'measurement', 'time', 'money', 'data', 'ratio_percentage', 'algebraic_thinking', 'problem_solving'],
  stem: ['sequencing', 'spatial_reasoning', 'algorithms', 'debugging', 'block_coding', 'robotics', 'sensors', 'electronics', 'engineering_design', 'programming', 'science_inquiry'],
  islamic: ['aqidah', 'quran', 'arabic', 'worship_fiqh', 'seerah', 'islamic_history', 'akhlaq_adab', 'duas', 'family_community', 'reflection_gratitude'],
  literacy: ['phonological_awareness', 'phonics', 'vocabulary', 'comprehension', 'writing', 'speaking_listening', 'grammar'],
};

/** Developmental band per level (shown to parents; the level decides eligibility). */
export const LEVEL_BAND: Record<Stage, string> = {
  age2_3: 'toddler', age3_4: 'preschool_early', age4_5: 'preschool_late', k: 'kindergarten', g1: 'early_primary', g2: 'early_primary',
  g3: 'middle_primary', g4: 'middle_primary', g5: 'upper_primary', g6: 'upper_primary',
};
/** Levels where the child does not read or use a screen alone: everything is caregiver-led. */
export const CAREGIVER_LED_LEVELS: readonly Stage[] = ['age2_3', 'age3_4', 'age4_5'];

const reviewRecord = z
  .object({
    agentChecks: z.array(plain(80)).default([]),
    reviewedBy: plain(80).optional(),
    reviewerRole: z.enum(['parent', 'educator', 'curriculum_reviewer']).optional(),
    reviewedAt: DATE.optional(),
    rejectedReason: plain(400).optional(),
  })
  .strict();

/** A machine-checkable arithmetic fact behind a maths question: e.g. { expression: "3/4 - 1/4", result: "1/2" }. */
const mathCheck = z.object({ expression: plain(120), result: plain(40) }).strict();

const assessmentItem = z
  .object({
    id: z.string().regex(/^a[0-9]+$/),
    prompt: loc,
    choices: z.object({ en: z.array(plain(200)).min(2).max(4), id: z.array(plain(200)).min(2).max(4) }).strict(),
    /** Index of the correct choice; graded server-side, never sent to the client before answering. */
    answer: z.number().int().min(0).max(3),
    explanation: loc,
    /** Required for maths units: the arithmetic the answer rests on, verified by the validator. */
    check: mathCheck.optional(),
    /** Misconception code a specific wrong choice reveals (index → code). */
    distractorMisconceptions: z.record(z.string().regex(/^[0-3]$/), z.string().regex(/^[A-Z][A-Z0-9_]+$/)).default({}),
  })
  .strict();

const source = z
  .object({
    kind: z.enum(['original', 'pedagogical_reference', 'religious_text', 'factual_reference']),
    title: plain(300),
    url: z.string().url().startsWith('https://').optional(),
    /** Only a person sets "verified" (with verifiedBy). The agent records what it could not verify. */
    verification: z.enum(['not_applicable', 'unverified', 'verified']),
    verifiedBy: plain(80).optional(),
    note: plain(400).optional(),
  })
  .strict();

const hazards = z.object({ chokingRisk: z.boolean(), sharp: z.boolean(), water: z.boolean(), heat: z.boolean(), allergens: z.boolean(), electrical: z.boolean() }).strict();

export const unitSchema = z
  .object({
    id: z.string().regex(/^unit-(age2_3|age3_4|age4_5|k|g[1-6])-[a-z]+-[a-z0-9-]+$/),
    version: SEMVER,
    level: z.enum(STAGES),
    framework: z.enum(UNIT_FRAMEWORKS),
    strand: plain(40),
    title: loc,
    prerequisites: z.array(z.string().regex(/^unit-[a-z0-9_-]+$/)).default([]),
    objective: loc,
    rationale: loc,
    outcomes: locList(2),
    successCriteria: locList(2),
    parentInstructions: locList(2),
    /** Child-facing wording; omitted only for caregiver-led levels. */
    childInstructions: z.array(loc).default([]),
    cpa: z.object({ concrete: locList(1), pictorial: locList(1), abstract: locList(1) }).strict().nullable(),
    materials: locList(1),
    preparation: locList(1),
    guidedExamples: locList(1),
    practice: locList(2),
    assessment: z.array(assessmentItem).min(3).max(8),
    misconceptions: z.array(z.object({ code: z.string().regex(/^[A-Z][A-Z0-9_]+$/), description: loc, remediation: loc }).strict()).min(1),
    extension: locList(1),
    accessibility: locList(1),
    safety: z.object({ supervision: z.enum(['adult_within_reach', 'adult_present', 'independent_ok']), hazards, notes: locList(1) }).strict(),
    durationMinutes: z.object({ min: z.number().int().min(2), max: z.number().int().max(60) }).strict(),
    mastery: z
      .object({
        evidence: z.enum(['parent_observation', 'assessment', 'both']),
        /** Spaced-review days after first secure evidence. */
        reviewAfterDays: z.array(z.number().int().min(1).max(120)).min(1),
        masteryRule: loc,
      })
      .strict(),
    sources: z.array(source).min(1),
    rights: z.literal('original'),
    arabicPhrases: z.array(arabicPhraseSchema).default([]),
    reviewFlags: z.array(plain(60)).default([]),
    reviewStatus: z.enum(REVIEW_STATUSES),
    review: reviewRecord,
    religiousReview: religiousReviewSchema.optional(),
    provenance: z.object({ origin: z.enum(['ai_drafted', 'human_authored']), batch: plain(60), createdAt: DATE }).strict(),
  })
  .strict();
export type Unit = z.infer<typeof unitSchema>;

export const READING_GENRES = ['fiction', 'nonfiction', 'biography', 'explanatory', 'procedural', 'report', 'poetry', 'article', 'picture_story_script', 'oral_story'] as const;
export const READING_MODES = ['parent_read', 'shared', 'independent'] as const;
export const READING_LEVELS = ['pre_reader', 'emergent', 'early', 'transitional', 'fluent', 'advanced'] as const;
export const CROSS_SUBJECTS = ['science_nature', 'technology_engineering', 'robotics_computing', 'mathematics', 'practical_life', 'cultural_studies', 'islamic_values', 'environment', 'geography', 'astronomy', 'health_safety', 'creativity'] as const;

export const readingSchema = z
  .object({
    id: z.string().regex(/^reading-(age2_3|age3_4|age4_5|k|g[1-6])-[a-z0-9-]+$/),
    version: SEMVER,
    level: z.enum(STAGES),
    readingLevel: z.enum(READING_LEVELS),
    genre: z.enum(READING_GENRES),
    mode: z.enum(READING_MODES),
    title: loc,
    /** Paragraphs (for scripts: one beat or page per entry). EN and ID are adapted, not mechanically translated. */
    text: z.object({ en: z.array(plain(900)).min(2).max(14), id: z.array(plain(900)).min(2).max(14) }).strict(),
    /** For parent-read scripts: what the grown-up does on each page (voices, pointing, actions). */
    readAloudNotes: z.array(loc).default([]),
    /** Picture/sequence cards for pre-readers (described for a parent to draw or print). */
    sequenceCards: z.array(loc).default([]),
    objectives: locList(1),
    vocabulary: z.array(z.object({ word: loc, meaning: loc }).strict()).min(2),
    questions: z
      .array(
        z
          .object({
            id: z.string().regex(/^q[0-9]+$/),
            kind: z.enum(['literal', 'sequence', 'vocabulary', 'inference', 'main_idea', 'evidence', 'critical', 'math', 'science', 'reflection']),
            prompt: loc,
            choices: z.object({ en: z.array(plain(220)).min(2).max(4), id: z.array(plain(220)).min(2).max(4) }).strict(),
            answer: z.number().int().min(0).max(3),
            evidenceParagraph: z.number().int().min(0),
            check: mathCheck.optional(),
          })
          .strict(),
      )
      .min(3)
      .max(8),
    crossCurricular: z.array(z.object({ subject: z.enum(CROSS_SUBJECTS), connection: loc }).strict()).default([]),
    discussionPrompts: locList(2),
    offlineActivity: loc,
    factChecks: z
      .array(z.object({ claim: plain(300), status: z.enum(['common_knowledge', 'sourced', 'invented_example', 'needs_source']), source: z.object({ title: plain(200), url: z.string().url().startsWith('https://') }).strict().optional() }).strict())
      .default([]),
    safetyNotes: z.array(loc).default([]),
    arabicPhrases: z.array(arabicPhraseSchema).default([]),
    reviewFlags: z.array(plain(60)).default([]),
    reviewStatus: z.enum(REVIEW_STATUSES),
    review: reviewRecord,
    religiousReview: religiousReviewSchema.optional(),
    provenance: z.object({ origin: z.enum(['ai_drafted', 'human_authored']), batch: plain(60), createdAt: DATE }).strict(),
  })
  .strict();
export type Reading = z.infer<typeof readingSchema>;

// ── Arithmetic verification (maths correctness) ──────────────────────────────────────────────────────────────────────

/** Exact rational arithmetic over + − × ÷ ( ) with integers, decimals and a/b fractions. No eval. */
type Q = { n: bigint; d: bigint };
const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? (a < 0n ? -a : a) : gcd(b, a % b));
const norm = (q: Q): Q => {
  if (q.d === 0n) throw new Error('division by zero');
  const s = q.d < 0n ? -1n : 1n;
  const g = gcd(q.n, q.d) || 1n;
  return { n: (s * q.n) / g, d: (s * q.d) / g };
};
const parseNum = (t: string): Q => {
  if (/^\d+\.\d+$/.test(t)) {
    const [a, b] = t.split('.') as [string, string];
    return norm({ n: BigInt(a + b), d: 10n ** BigInt(b.length) });
  }
  if (/^\d+$/.test(t)) return { n: BigInt(t), d: 1n };
  throw new Error(`bad number ${t}`);
};
export function evaluateArithmetic(expr: string): Q {
  const src = expr.replace(/×|x(?=\s*[\d(])/g, '*').replace(/÷|:/g, '/').replace(/−/g, '-').replace(/,(?=\d{3}\b)/g, '');
  const tokens = src.match(/\d+(?:\.\d+)?|[-+*/()]/g);
  if (!tokens || tokens.join('') !== src.replace(/\s+/g, '')) throw new Error(`unsupported expression: ${expr}`);
  let i = 0;
  const peek = () => tokens[i];
  const factor = (): Q => {
    const t = tokens[i++];
    if (t === '(') {
      const v = sum();
      if (tokens[i++] !== ')') throw new Error('missing )');
      return v;
    }
    if (t === '-') {
      const v = factor();
      return { n: -v.n, d: v.d };
    }
    if (t === undefined) throw new Error('unexpected end');
    return parseNum(t);
  };
  const term = (): Q => {
    let v = factor();
    while (peek() === '*' || peek() === '/') {
      const op = tokens[i++];
      const r = factor();
      v = op === '*' ? norm({ n: v.n * r.n, d: v.d * r.d }) : norm({ n: v.n * r.d, d: v.d * r.n });
    }
    return v;
  };
  const sum = (): Q => {
    let v = term();
    while (peek() === '+' || peek() === '-') {
      const op = tokens[i++];
      const r = term();
      v = norm({ n: op === '+' ? v.n * r.d + r.n * v.d : v.n * r.d - r.n * v.d, d: v.d * r.d });
    }
    return v;
  };
  const v = sum();
  if (i !== tokens.length) throw new Error(`trailing tokens in ${expr}`);
  return norm(v);
}
/** Parses a stated result: integer, decimal, fraction a/b, mixed number "1 1/2", optional % or unit words after it. */
export function parseResult(s: string): Q {
  const t = s.trim().replace(/,(?=\d{3}\b)/g, '');
  const mixed = /^(-?\d+)\s+(\d+)\/(\d+)/.exec(t);
  if (mixed) {
    const w = BigInt(mixed[1]!);
    const f = norm({ n: BigInt(mixed[2]!), d: BigInt(mixed[3]!) });
    return norm({ n: w * f.d + (w < 0n ? -f.n : f.n), d: f.d });
  }
  const frac = /^(-?\d+)\/(\d+)/.exec(t);
  if (frac) return norm({ n: BigInt(frac[1]!), d: BigInt(frac[2]!) });
  const dec = /^(-?\d+(?:\.\d+)?)\s*%/.exec(t);
  if (dec) {
    const q = parseNum(dec[1]!.replace('-', ''));
    return norm({ n: (dec[1]!.startsWith('-') ? -q.n : q.n), d: q.d * 100n });
  }
  const num = /^(-?\d+(?:\.\d+)?)/.exec(t);
  if (num) {
    const q = parseNum(num[1]!.replace('-', ''));
    return num[1]!.startsWith('-') ? { n: -q.n, d: q.d } : q;
  }
  throw new Error(`cannot parse result "${s}"`);
}
const eqQ = (a: Q, b: Q) => a.n === b.n && a.d === b.d;

function checkMath(id: string, c: { expression: string; result: string }, correctChoiceEn: string): string[] {
  try {
    const value = evaluateArithmetic(c.expression);
    const stated = parseResult(c.result);
    const out: string[] = [];
    if (!eqQ(value, stated)) out.push(`${id}: ${c.expression} is not ${c.result}`);
    const firstNumber = /-?\d[\d,]*(?:\.\d+)?(?:\s+\d+\/\d+|\/\d+)?\s*%?/.exec(correctChoiceEn);
    if (!firstNumber) out.push(`${id}: the correct choice "${correctChoiceEn}" contains no number to check`);
    else if (!eqQ(parseResult(firstNumber[0]), stated)) out.push(`${id}: the correct choice "${correctChoiceEn}" does not match the checked result ${c.result}`);
    return out;
  } catch (e) {
    return [`${id}: ${(e as Error).message}`];
  }
}

// ── Validation ───────────────────────────────────────────────────────────────────────────────────────────────────────

const stageRank = (s: Stage) => STAGES.indexOf(s);
const rank = (s: ReviewStatus) => REVIEW_STATUSES.indexOf(s);
const allText = (o: unknown): string => (typeof o === 'string' ? o : Array.isArray(o) ? o.map(allText).join(' ') : o && typeof o === 'object' ? Object.values(o).map(allText).join(' ') : '');
const enText = (o: unknown): string =>
  Array.isArray(o) ? o.map(enText).join(' ') : o && typeof o === 'object' ? ('en' in (o as object) && typeof (o as { en: unknown }).en === 'string' ? (o as { en: string }).en : Object.entries(o).filter(([k]) => k !== 'id').map(([, v]) => enText(v)).join(' ')) : '';

export const UNIT_NEAR_DUPLICATE = 0.45;
export const READING_NEAR_DUPLICATE = 0.3;

/** Subject-level checks for one unit (beyond the schema). */
export function unitIssues(u: Unit): string[] {
  const out: string[] = [];
  const p = u.id.split('-');
  if (p[1] !== u.level) out.push(`${u.id}: id level ${p[1]} ≠ level ${u.level}`);
  if (!UNIT_STRANDS[u.framework].includes(u.strand)) out.push(`${u.id}: strand ${u.strand} is not a ${u.framework} strand`);
  if (u.durationMinutes.min > u.durationMinutes.max) out.push(`${u.id}: duration min > max`);
  if (!CAREGIVER_LED_LEVELS.includes(u.level) && u.childInstructions.length === 0) out.push(`${u.id}: child instructions are required from Kindergarten up`);
  if (u.framework === 'math' && !u.cpa) out.push(`${u.id}: maths units need concrete, pictorial and abstract activities`);
  for (const a of u.assessment) {
    if (a.choices.en.length !== a.choices.id.length) out.push(`${u.id}/${a.id}: choice count differs by language`);
    if (a.answer >= a.choices.en.length) out.push(`${u.id}/${a.id}: answer out of range`);
    if (new Set(a.choices.en.map((c) => c.toLowerCase())).size !== a.choices.en.length) out.push(`${u.id}/${a.id}: duplicate choices`);
    for (const k of Object.keys(a.distractorMisconceptions)) {
      if (Number(k) === a.answer) out.push(`${u.id}/${a.id}: the correct choice cannot be a misconception`);
      if (!u.misconceptions.some((m) => m.code === a.distractorMisconceptions[k])) out.push(`${u.id}/${a.id}: misconception ${a.distractorMisconceptions[k]} is not described in the unit`);
    }
    if (u.framework === 'math' && !a.check && /\d/.test(a.choices.en[a.answer] ?? '')) out.push(`${u.id}/${a.id}: numeric maths answers need a machine check`);
    if (a.check) out.push(...checkMath(`${u.id}/${a.id}`, a.check, a.choices.en[a.answer] ?? ''));
  }
  if (new Set(u.assessment.map((a) => a.id)).size !== u.assessment.length) out.push(`${u.id}: duplicate assessment ids`);
  // Physical safety: hazard words in what the family handles need a flag or a safety note naming them.
  const handled = enText([u.materials, u.preparation, u.cpa?.concrete ?? [], u.practice, u.extension]).toLowerCase();
  const notes = enText(u.safety.notes).toLowerCase();
  for (const { flag, re } of HAZARD_KEYWORDS) {
    const m = handled.match(re);
    if (m && !u.safety.hazards[flag] && !re.test(notes)) out.push(`${u.id}: "${m[0]}" is used but hazards.${flag} is false and no safety note names it`);
  }
  if (/\b(battery|batteries|wire|led|circuit|motor|plug|socket|mains)\b/.test(handled) && !u.safety.hazards.electrical && !/battery|electric|circuit|wire/.test(notes)) out.push(`${u.id}: electrical materials need hazards.electrical or an electrical safety note`);
  if (u.safety.hazards.chokingRisk && ['age2_3', 'age3_4'].includes(u.level)) out.push(`${u.id}: no choking-hazard materials for under-4s`);
  if (u.level === 'age2_3' && u.safety.supervision !== 'adult_within_reach') out.push(`${u.id}: toddler units need an adult within reach`);
  // Islamic: never self-approved; Arabic and citations wait for a qualified reviewer.
  if (u.framework === 'islamic' || u.arabicPhrases.length) {
    if (!u.religiousReview) out.push(`${u.id}: Islamic or Arabic content needs a religiousReview record`);
    else if (u.religiousReview.approvalStatus === 'approved' && !(u.religiousReview.scholarReviewer && u.religiousReview.reviewedAt)) out.push(`${u.id}: approved religious review needs a named scholar and date`);
    if (u.arabicPhrases.length && !u.reviewFlags.includes('arabic_text')) out.push(`${u.id}: Arabic text must carry the arabic_text review flag`);
  }
  for (const s of u.sources) if (s.verification === 'verified' && !s.verifiedBy) out.push(`${u.id}: a verified source needs verifiedBy (a person)`);
  if (u.provenance.origin === 'ai_drafted' && rank(u.reviewStatus) >= rank('reviewed') && !(u.review.reviewedBy && u.review.reviewedAt)) out.push(`${u.id}: AI-drafted content cannot be reviewed/published without a human review record`);
  return out;
}

export function readingIssues(r: Reading): string[] {
  const out: string[] = [];
  if (r.id.split('-')[1] !== r.level) out.push(`${r.id}: id level ≠ level ${r.level}`);
  if (r.text.en.length !== r.text.id.length) out.push(`${r.id}: EN and ID must have the same paragraphs`);
  if (CAREGIVER_LED_LEVELS.includes(r.level) && r.mode !== 'parent_read') out.push(`${r.id}: pre-reader materials are parent-read`);
  if (CAREGIVER_LED_LEVELS.includes(r.level) && r.readAloudNotes.length === 0) out.push(`${r.id}: parent-read scripts need read-aloud notes`);
  if (['age2_3', 'age3_4'].includes(r.level) && r.sequenceCards.length < 3) out.push(`${r.id}: pre-reader materials need at least 3 sequence cards`);
  const informational = ['nonfiction', 'biography', 'explanatory', 'report', 'article', 'procedural'].includes(r.genre);
  if (informational && r.factChecks.length === 0) out.push(`${r.id}: ${r.genre} texts must list their factual claims`);
  for (const f of r.factChecks) if (f.status === 'sourced' && !f.source) out.push(`${r.id}: a sourced claim needs its source`);
  if (/\b(study|studies|research|survey|scientists found|experiment showed)\b/i.test(r.text.en.join(' ')) && !r.factChecks.some((f) => f.status === 'invented_example' || f.status === 'sourced')) out.push(`${r.id}: a described study must be sourced or labelled as invented`);
  for (const q of r.questions) {
    if (q.choices.en.length !== q.choices.id.length) out.push(`${r.id}/${q.id}: choice count differs by language`);
    if (q.answer >= q.choices.en.length) out.push(`${r.id}/${q.id}: answer out of range`);
    if (q.evidenceParagraph >= r.text.en.length) out.push(`${r.id}/${q.id}: evidence paragraph out of range`);
    if (new Set(q.choices.en.map((c) => c.toLowerCase())).size !== q.choices.en.length) out.push(`${r.id}/${q.id}: duplicate choices`);
    if (q.kind === 'inference') {
      const ans = (q.choices.en[q.answer] ?? '').toLowerCase().replace(/[.!?]$/, '');
      if (ans.split(/\s+/).length <= 2 && new RegExp(`\\b${ans.replace(/[^a-z0-9 ]/g, '')}\\b`).test(r.text.en.join(' ').toLowerCase())) out.push(`${r.id}/${q.id}: the inference answer is stated in the text`);
    }
    if (q.kind === 'math' && q.check) out.push(...checkMath(`${r.id}/${q.id}`, q.check, q.choices.en[q.answer] ?? ''));
    if (q.kind === 'math' && !q.check) out.push(`${r.id}/${q.id}: maths questions need a machine check`);
  }
  if (r.crossCurricular.some((c) => c.subject === 'islamic_values') || r.arabicPhrases.length) {
    if (!r.religiousReview) out.push(`${r.id}: Islamic content needs a religiousReview record`);
  }
  if (r.provenance.origin === 'ai_drafted' && rank(r.reviewStatus) >= rank('reviewed') && !(r.review.reviewedBy && r.review.reviewedAt)) out.push(`${r.id}: AI-drafted content cannot be reviewed/published without a human review record`);
  return out;
}

export interface ExpansionContent {
  units: Unit[];
  readings: Reading[];
}

/** Validates raw unit and reading JSON: schema, subject checks, prerequisites (existence, level, cycles), duplicates. */
export function validateExpansion(raw: { units: unknown[]; readings: unknown[] }): { content: ExpansionContent; errors: string[] } {
  const errors: string[] = [];
  const units: Unit[] = [];
  const readings: Reading[] = [];
  for (const x of raw.units) {
    const r = unitSchema.safeParse(x);
    if (r.success) units.push(r.data);
    else errors.push(`unit ${(x as { id?: string })?.id ?? '?'}: ${r.error.issues.slice(0, 6).map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
  }
  for (const x of raw.readings) {
    const r = readingSchema.safeParse(x);
    if (r.success) readings.push(r.data);
    else errors.push(`reading ${(x as { id?: string })?.id ?? '?'}: ${r.error.issues.slice(0, 6).map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
  }
  const ids = new Map<string, number>();
  for (const x of [...units, ...readings]) ids.set(x.id, (ids.get(x.id) ?? 0) + 1);
  for (const [id, n] of ids) if (n > 1) errors.push(`duplicate id ${id}`);
  const byId = new Map(units.map((u) => [u.id, u]));
  for (const u of units) {
    errors.push(...unitIssues(u));
    for (const p of u.prerequisites) {
      const pre = byId.get(p);
      if (!pre) errors.push(`${u.id}: unknown prerequisite ${p}`);
      else if (stageRank(pre.level) > stageRank(u.level)) errors.push(`${u.id}: prerequisite ${p} is for a later level`);
    }
  }
  // Cycles (DFS)
  const state = new Map<string, 1 | 2>();
  const visit = (id: string, path: string[]) => {
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) {
      errors.push(`prerequisite cycle: ${[...path, id].join(' → ')}`);
      return;
    }
    state.set(id, 1);
    for (const p of byId.get(id)?.prerequisites ?? []) if (byId.has(p)) visit(p, [...path, id]);
    state.set(id, 2);
  };
  for (const u of units) visit(u.id, []);
  for (const r of readings) errors.push(...readingIssues(r));
  // Near-duplicates: units within a level and framework; readings within a level.
  const unitKey = (u: Unit) => enText([u.objective, u.guidedExamples, u.practice]);
  for (let i = 0; i < units.length; i++)
    for (let j = i + 1; j < units.length; j++) {
      const [a, b] = [units[i]!, units[j]!];
      if (a.level !== b.level || a.framework !== b.framework) continue;
      const s = textSimilarity(unitKey(a), unitKey(b));
      if (s >= UNIT_NEAR_DUPLICATE) errors.push(`units ${a.id} and ${b.id} are near-duplicates (${s.toFixed(2)})`);
    }
  for (let i = 0; i < readings.length; i++)
    for (let j = i + 1; j < readings.length; j++) {
      const [a, b] = [readings[i]!, readings[j]!];
      if (a.level !== b.level) continue;
      const s = textSimilarity(a.text.en.join(' '), b.text.en.join(' '));
      if (s >= READING_NEAR_DUPLICATE) errors.push(`readings ${a.id} and ${b.id} are near-duplicates (${s.toFixed(2)})`);
    }
  void allText;
  return { content: { units, readings }, errors };
}

/** Production visibility: human review recorded, no open factual claims, and (Islamic/Arabic) an approved scholar review. */
export function isExpansionVisible(x: Unit | Reading, minReview: ReviewStatus): boolean {
  if (x.review.rejectedReason) return false; // a rejected item is never shown, in any environment
  if (rank(x.reviewStatus) < rank(minReview)) return false;
  if (rank(minReview) >= rank('reviewed')) {
    if (!(x.review.reviewedBy && x.review.reviewedAt)) return false;
    const religious = ('framework' in x && x.framework === 'islamic') || x.arabicPhrases.length > 0 || ('crossCurricular' in x && x.crossCurricular.some((c) => c.subject === 'islamic_values'));
    if (religious && !(x.religiousReview?.approvalStatus === 'approved' && x.religiousReview.scholarReviewer && x.religiousReview.reviewedAt)) return false;
    if ('factChecks' in x && x.factChecks.some((f) => f.status === 'needs_source')) return false;
  }
  return true;
}

export const PIPELINE_STATES = ['drafted', 'structurally_validated', 'subject_validated', 'human_reviewed', 'published'] as const;
export type PipelineState = (typeof PIPELINE_STATES)[number] | 'rejected';
/** Computed pipeline state. `errors` are the validator errors that mention this item. */
export function pipelineState(x: Unit | Reading, errors: string[]): PipelineState {
  if (x.review.rejectedReason) return 'rejected';
  const mine = errors.filter((e) => e.includes(x.id));
  if (mine.length) return 'structurally_validated';
  if (isExpansionVisible(x, 'reviewed')) return x.reviewStatus === 'published' ? 'published' : 'human_reviewed';
  return 'subject_validated';
}

/** Client view of a unit's assessment: no answer key, no checks, no misconception map. */
export function unitAssessmentForClient(u: Unit, locale: 'en' | 'id') {
  return u.assessment.map((a) => ({ id: a.id, prompt: a.prompt[locale], choices: a.choices[locale] }));
}
export function gradeUnitAssessment(u: Unit, answers: Record<string, number>) {
  const results = u.assessment.map((a) => {
    const given = answers[a.id];
    const correct = given === a.answer;
    return { id: a.id, correct, misconception: !correct && given !== undefined ? (a.distractorMisconceptions[String(given)] ?? null) : null, explanation: a.explanation };
  });
  return { correct: results.filter((r) => r.correct).length, total: results.length, results };
}

// ── Loaded corpus ────────────────────────────────────────────────────────────────────────────────────────────────────
import { RAW_READINGS, RAW_UNITS } from './content-index';
let cached: (ExpansionContent & { errors: string[] }) | null = null;
/** The validated expansion corpus (cached). Items with validation errors are still returned, flagged via `errors`. */
export function getExpansion(): ExpansionContent & { errors: string[] } {
  if (!cached) {
    const { content, errors } = validateExpansion({ units: RAW_UNITS, readings: RAW_READINGS });
    cached = { ...content, errors };
  }
  return cached;
}
