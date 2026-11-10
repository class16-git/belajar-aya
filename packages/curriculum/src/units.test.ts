import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { evaluateArithmetic, gradeUnitAssessment, isExpansionVisible, parseResult, pipelineState, unitAssessmentForClient, validateExpansion, type Unit } from './units';
import { RAW_READINGS, RAW_UNITS } from './content-index';

const repo = join(import.meta.dirname, '../../..');
const refUnit = () => JSON.parse(readFileSync(join(repo, 'content/units/g2/math/unit-g2-math-place-value-hundreds.json'), 'utf8')) as Unit & Record<string, unknown>;
const refReading = () => JSON.parse(readFileSync(join(repo, 'content/readings/age2_3/reading-age2_3-little-cat-bath.json'), 'utf8'));
const errs = (units: unknown[], readings: unknown[] = []) => validateExpansion({ units, readings }).errors;

describe('expansion corpus', () => {
  it('every indexed unit and reading passes structural and subject validation', () => {
    expect(validateExpansion({ units: RAW_UNITS, readings: RAW_READINGS }).errors).toEqual([]);
  });
  it('nothing AI-drafted is visible in production without a human review record', () => {
    const { content } = validateExpansion({ units: RAW_UNITS, readings: RAW_READINGS });
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
