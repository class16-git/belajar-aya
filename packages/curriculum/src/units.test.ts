import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contentHash, evaluateArithmetic, gradeUnitAssessment, isExpansionVisible, parseResult, pipelineState, unitAssessmentForClient, validateExpansion, type Unit } from './units';
import { expansionSummary, findExpansionItem, loadExpansionLevel, loadRawExpansion } from './expansion-store';

const repo = join(import.meta.dirname, '../../..');
/** The reference unit as an UNREVIEWED copy (the shipped file carries the owner's approval). */
const refUnit = () => {
  const u = JSON.parse(readFileSync(join(repo, 'content/units/g2/math/unit-g2-math-place-value-hundreds.json'), 'utf8')) as Unit & Record<string, unknown>;
  u.reviewStatus = 'agent_reviewed';
  u.review = { agentChecks: u.review.agentChecks };
  return u;
};
const refReading = () => JSON.parse(readFileSync(join(repo, 'content/readings/age2_3/reading-age2_3-little-cat-bath.json'), 'utf8'));
const errs = (units: unknown[], readings: unknown[] = []) => validateExpansion({ units, readings }).errors;

describe('expansion corpus', () => {
  it('every indexed unit and reading passes structural and subject validation', async () => {
    expect(validateExpansion(await loadRawExpansion()).errors).toEqual([]);
  });
  it('the precomputed summary matches the content: same ids, states and production visibility (index is current)', async () => {
    const raw = await loadRawExpansion();
    const { content, errors } = validateExpansion(raw);
    const s = expansionSummary();
    expect(s.errors).toEqual(errors);
    const all = [...content.units, ...content.readings];
    expect(s.items.map((x) => x.id).sort()).toEqual(all.map((x) => x.id).sort());
    for (const x of all) {
      const row = s.items.find((r) => r.id === x.id)!;
      expect(row.version, x.id).toBe(x.version);
      expect(row.state, x.id).toBe(pipelineState(x, errors));
      expect(row.visibleAt.reviewed, x.id).toBe(isExpansionVisible(x, 'reviewed'));
    }
  });
  it('the generated index is current: every unit and reading file on disk is indexed (run `pnpm --filter @atlas/curriculum index`)', async () => {
    const { readdirSync, statSync } = await import('node:fs');
    const ids: string[] = [];
    const walk = (d: string) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/^(unit|reading)-.*\.json$/.test(f)) ids.push(f.replace(/\.json$/, '')); } };
    walk(join(repo, 'content/units'));
    walk(join(repo, 'content/readings'));
    expect(expansionSummary().items.map((x) => x.id).sort()).toEqual(ids.sort());
  });
  it('every approved item is visible in production unless it has a documented reason (open source claim, scholar gate)', async () => {
    const { content, errors } = validateExpansion(await loadRawExpansion());
    for (const x of [...content.units, ...content.readings]) {
      if (!x.review.reviewedBy) continue;
      const religious = ('framework' in x && x.framework === 'islamic') || x.arabicPhrases.length > 0 || ('crossCurricular' in x && x.crossCurricular.some((c) => c.subject === 'islamic_values'));
      const openClaim = 'factChecks' in x && x.factChecks.some((f) => f.status === 'needs_source');
      if (religious || openClaim || x.review.rejectedReason || errors.some((e) => e.includes(x.id))) continue;
      expect(isExpansionVisible(x, 'reviewed'), `${x.id}: approved but hidden (stale or missing reviewedVersion/reviewedHash?)`).toBe(true);
    }
  });
  it('loads one level at a time and finds an item by id without loading other levels', async () => {
    const g2 = await loadExpansionLevel('g2');
    expect(g2.units.every((u) => u.level === 'g2') && g2.readings.every((r) => r.level === 'g2')).toBe(true);
    expect((await findExpansionItem('unit-g2-math-place-value-hundreds'))?.item.id).toBe('unit-g2-math-place-value-hundreds');
    expect(await findExpansionItem('unit-zz-math-nope')).toBeNull();
  });
  it('nothing AI-drafted is visible in production without a human review record', async () => {
    const { content } = validateExpansion(await loadRawExpansion());
    for (const x of [...content.units, ...content.readings]) if (!x.review.reviewedBy) expect(isExpansionVisible(x, 'reviewed'), x.id).toBe(false);
  });
});

describe('maths correctness', () => {
  it('evaluates exact rational arithmetic', () => {
    expect(evaluateArithmetic('3/4 - 1/4')).toEqual(parseResult('1/2'));
    expect(evaluateArithmetic('2.5 × 4')).toEqual(parseResult('10'));
    expect(evaluateArithmetic('(12 + 8) ÷ 5')).toEqual(parseResult('4'));
    expect(evaluateArithmetic('25 / 100')).toEqual(parseResult('25%'));
    expect(parseResult('1 1/2')).toEqual(evaluateArithmetic('3/2'));
    expect(() => evaluateArithmetic('alert(1)')).toThrow();
  });
  it('rejects a wrong checked result and a correct choice that disagrees with the check', () => {
    const u = refUnit();
    u.assessment[0]!.check = { expression: '4 * 10', result: '400' };
    expect(errs([u]).join()).toMatch(/4 \* 10 is not 400/);
    const v = refUnit();
    v.assessment[0]!.answer = 1; // "4" is now marked correct but the check says 40
    v.assessment[0]!.distractorMisconceptions = {};
    expect(errs([v]).join()).toMatch(/does not match the checked result/);
    const w = refUnit();
    delete w.assessment[2]!.check;
    expect(errs([w]).join()).toMatch(/need a machine check/);
  });
});

describe('structure, prerequisites, duplicates, safety, religion', () => {
  it('prerequisites must exist, not point to a later level, and not form cycles', () => {
    const a = refUnit();
    a.prerequisites = ['unit-g2-math-missing'];
    expect(errs([a]).join()).toMatch(/unknown prerequisite/);
    const b = refUnit();
    b.id = 'unit-g2-math-b';
    const c = { ...refUnit(), id: 'unit-g2-math-c', objective: { en: 'Completely different objective about measuring length in centimetres', id: 'Tujuan berbeda' }, guidedExamples: [{ en: 'Measure a pencil with a ruler and read the centimetres.', id: 'Ukur pensil.' }], practice: [{ en: 'Measure three spoons and order them by length.', id: 'Ukur sendok.' }, { en: 'Estimate then measure a book cover.', id: 'Perkirakan.' }] };
    b.prerequisites = ['unit-g2-math-c'];
    c.prerequisites = ['unit-g2-math-b'];
    expect(errs([b, c]).join()).toMatch(/prerequisite cycle/);
  });
  it('rejects near-duplicate units and readings and duplicate ids', () => {
    const a = refUnit();
    const b = { ...refUnit(), id: 'unit-g2-math-place-value-copy' };
    expect(errs([a, b]).join()).toMatch(/near-duplicates/);
    expect(errs([a, refUnit()]).join()).toMatch(/duplicate id/);
    const r2 = { ...refReading(), id: 'reading-age2_3-copy' };
    expect(errs([], [refReading(), r2]).join()).toMatch(/near-duplicates/);
  });
  it('hazard words need flags or notes; under-4s never get choking hazards; electrical needs a note', () => {
    const u = refUnit();
    u.materials = [...u.materials, { en: 'A bag of dried beans', id: 'Kacang kering' }];
    expect(errs([u]).join()).toMatch(/beans.*chokingRisk/);
    const e = refUnit();
    e.materials = [{ en: 'A battery, wire and an LED', id: 'Baterai' }];
    e.safety.notes = [{ en: 'Adult nearby.', id: 'Orang dewasa.' }];
    expect(errs([e]).join()).toMatch(/electrical/);
  });
  it('Islamic units need a religious review record, are never visible without a named scholar, and cannot self-verify sources', () => {
    const u = refUnit();
    u.id = 'unit-g2-islamic-test';
    u.framework = 'islamic';
    u.strand = 'akhlaq_adab';
    u.cpa = null;
    u.assessment.forEach((a) => delete a.check);
    u.sources = [{ kind: 'religious_text', title: 'Al-Qawl al-Jaliyy', verification: 'verified' }];
    const e = errs([u]).join();
    expect(e).toMatch(/needs a religiousReview record/);
    expect(e).toMatch(/verified source needs verifiedBy/);
    const v = { ...u, reviewStatus: 'reviewed' as const, review: { agentChecks: [], reviewedBy: 'owner', reviewerRole: 'parent' as const, reviewedAt: '2026-11-10' }, religiousReview: { doctrinalSchool: null, fiqhSchool: null, arabicSource: null, edition: null, pageOrSection: null, translationReviewer: null, scholarReviewer: null, reviewedAt: null, approvalStatus: 'unverified' as const, notes: [] } };
    expect(isExpansionVisible(v as Unit, 'reviewed')).toBe(false);
  });
  it('an approval covers only the reviewed version: an edit after approval hides the item until it is re-reviewed', () => {
    const u = validateExpansion({ units: [refUnit()], readings: [] }).content.units[0]!;
    const approved = { ...u, reviewStatus: 'reviewed' as const, review: { ...u.review, reviewedBy: 'AB', reviewerRole: 'parent' as const, reviewedAt: '2026-11-11', reviewedVersion: u.version, reviewedHash: contentHash(u) } };
    expect(isExpansionVisible(approved, 'reviewed')).toBe(true);
    expect(isExpansionVisible({ ...approved, version: '9.9.9' }, 'reviewed')).toBe(false);
    expect(isExpansionVisible({ ...approved, review: { ...approved.review, reviewedVersion: undefined } }, 'reviewed')).toBe(false);
  });
  it('the content fingerprint is identical in the validator and in apply-reviews.mjs, for every file (raw or parsed)', async () => {
    // @ts-expect-error untyped .mjs script
    const cli = (await import('../../../apps/web/scripts/apply-reviews.mjs')) as { contentHash: (x: unknown) => string };
    const raw = await loadRawExpansion();
    const { content } = validateExpansion(raw);
    const parsed = new Map([...content.units, ...content.readings].map((x) => [x.id, x]));
    for (const r of [...raw.units, ...raw.readings] as { id: string }[]) {
      const p = parsed.get(r.id);
      if (p) expect(contentHash(p), r.id).toBe(cli.contentHash(r));
    }
  });
  it('an approval covers only the reviewed content: an edit without a version bump still hides the item', () => {
    const u = validateExpansion({ units: [refUnit()], readings: [] }).content.units[0]!;
    const approved = { ...u, reviewStatus: 'reviewed' as const, review: { ...u.review, reviewedBy: 'AB', reviewerRole: 'parent' as const, reviewedAt: '2026-11-11', reviewedVersion: u.version, reviewedHash: contentHash(u) } };
    expect(isExpansionVisible(approved, 'reviewed')).toBe(true);
    const edited = { ...approved, objective: { ...approved.objective, en: approved.objective.en + ' Edited.' } };
    expect(isExpansionVisible(edited, 'reviewed')).toBe(false);
  });
  it('a rejected item is never visible, even in preview', () => {
    const u = validateExpansion({ units: [refUnit()], readings: [] }).content.units[0]!;
    expect(isExpansionVisible(u, 'agent_reviewed')).toBe(true);
    expect(isExpansionVisible({ ...u, review: { ...u.review, rejectedReason: 'Wrong level' } }, 'agent_reviewed')).toBe(false);
  });
  it('AI-drafted content cannot be marked reviewed without a human record', () => {
    const u = refUnit();
    u.reviewStatus = 'published';
    expect(errs([u]).join()).toMatch(/cannot be reviewed\/published without a human review record/);
  });
  it('pre-reader readings must be parent-read with read-aloud notes and sequence cards', () => {
    const r = refReading();
    r.mode = 'independent';
    r.sequenceCards = [];
    const e = errs([], [r]).join();
    expect(e).toMatch(/parent-read/);
    expect(e).toMatch(/sequence cards/);
  });
});

describe('server-side grading', () => {
  it('never sends the key, grades by choice, and maps wrong choices to misconceptions', () => {
    const u = validateExpansion({ units: [refUnit()], readings: [] }).content.units[0]!;
    expect(JSON.stringify(unitAssessmentForClient(u, 'en'))).not.toMatch(/answer|check|distractor/);
    const g = gradeUnitAssessment(u, { a1: 1, a2: 0, a3: 0, a4: 0 });
    expect(g.correct).toBe(3);
    expect(g.results[0]!.misconception).toBe('DIGIT_FACE_VALUE');
    expect(pipelineState(u, [])).toBe('subject_validated');
    expect(pipelineState(u, [`${u.id}: x`])).toBe('structurally_validated');
  });
});
