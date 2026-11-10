import { getCatalog, visibleInteractiveLessons } from '@atlas/curriculum';
import { exactCalendarAge, safetyPolicy } from '@atlas/shared';
import { describe, expect, it } from 'vitest';
import {
  initialState,
  masteryStatus,
  updateMastery,
  type Evidence,
  type MasteryState,
} from './mastery';
import { lessonChoices, recommendNext, recommendOfflineCards, type RecommendInput } from './recommend';

const T0 = new Date('2026-11-10T02:00:00Z');
const at = (min: number) => new Date(T0.getTime() + min * 60_000);
const g1Policy = safetyPolicy(exactCalendarAge('2019-08-15', '2026-11-10'), 'ELEMENTARY_GUIDED');

/** Tiny simulator: applies evidence to a mastery map + recent evidence list (most recent first). */
class Learner {
  mastery = new Map<string, MasteryState>();
  evidence: Evidence[] = [];
  rules: string[][] = [];
  answer(e: Omit<Evidence, 'at'> & { at?: Date }) {
    const ev: Evidence = { at: at(this.evidence.length), ...e };
    const u = updateMastery(this.mastery.get(ev.skillId) ?? null, ev);
    this.mastery.set(ev.skillId, u.state);
    this.evidence.unshift(ev);
    this.rules.push(u.rules);
    return u;
  }
  input(now: Date, focus: string | null = null): RecommendInput {
    const cat = getCatalog();
    return {
      now,
      policy: g1Policy,
      band: 'g1',
      skills: cat.skills,
      lessons: visibleInteractiveLessons('agent_reviewed'),
      mastery: this.mastery,
      recentEvidence: this.evidence,
      focusSkillId: focus,
    };
  }
}
const ok = (skillId: string, format: string): Omit<Evidence, 'at'> => ({
  skillId,
  correct: true,
  hintsUsed: 0,
  tryNumber: 1,
  format,
  misconception: null,
});
const COUNT = 'MATH-G1-COUNT-20';
const BONDS = 'MATH-G1-BONDS-10';

describe('mastery update rules', () => {
  it('initialises at 0.35 and applies +0.12 / +0.05 / -0.08, clamped to [0,1]', () => {
    let s = updateMastery(null, { ...ok(BONDS, 'make-ten-frame'), at: T0 });
    expect(s.rules).toEqual(['M1_INIT', 'M2_INDEPENDENT_CORRECT']);
    expect(s.state.score).toBe(0.47);
    s = updateMastery(s.state, { ...ok(BONDS, 'make-ten-frame'), hintsUsed: 1, at: T0 });
    expect(s.state.score).toBe(0.52);
    s = updateMastery(s.state, { ...ok(BONDS, 'x'), correct: false, misconception: 'COUNTING_ERROR', at: T0 });
    expect(s.state.score).toBe(0.44);
    let low = initialState(BONDS);
    for (let i = 0; i < 10; i++) low = updateMastery(low, { ...ok(BONDS, 'x'), correct: false, at: T0 }).state;
    expect(low.score).toBe(0);
  });
});

describe('golden learner traces (docs/spec/delivery/ROADMAP_ACCEPTANCE.md)', () => {
  it('scenario 1: independent correct on 6+4 with a ten-frame raises the skill score', () => {
    const l = new Learner();
    const before = l.mastery.get(BONDS)?.score ?? 0.35;
    l.answer(ok(BONDS, 'make-ten-frame'));
    expect(l.mastery.get(BONDS)!.score).toBeGreaterThan(before);
    expect(l.mastery.get(BONDS)!.independentCorrect).toBe(1);
  });

  it('scenario 2: the same error twice routes to concrete number-bond practice, not harder work', () => {
    const l = new Learner();
    // Prerequisite already secure so remediation stays on the skill itself.
    for (const f of ['count-ten-frame', 'count-scattered', 'count-ten-frame', 'count-scattered']) l.answer(ok(COUNT, f));
    l.answer(ok(BONDS, 'number-bond'));
    l.answer(ok(BONDS, 'number-bond'));
    l.answer({ ...ok(BONDS, 'bond-equation'), correct: false, misconception: 'COUNTING_ERROR' });
    l.answer({ ...ok(BONDS, 'bond-equation'), correct: false, misconception: 'COUNTING_ERROR' });
    const rec = recommendNext(l.input(at(30)));
    expect(rec.kind).toBe('interactive');
    if (rec.kind !== 'interactive') return;
    expect(rec.ruleId).toBe('R2_MISCONCEPTION_REMEDIATE_CONCRETE');
    expect(rec.skillId).toBe(BONDS);
    expect(rec.cpaStage).toBe('concrete');
    expect(rec.difficulty).toBe(1);
    expect(rec.reason.en).toMatch(/COUNTING_ERROR/);
  });

  it('scenario 2b: repeated error with a weak prerequisite routes to the prerequisite', () => {
    const l = new Learner();
    l.answer({ ...ok(BONDS, 'make-ten-frame'), correct: false, misconception: 'COUNTING_ERROR' });
    l.answer({ ...ok(BONDS, 'make-ten-frame'), correct: false, misconception: 'COUNTING_ERROR' });
    const rec = recommendNext(l.input(at(30)));
    expect(rec.kind === 'interactive' && rec.ruleId).toBe('R2_MISCONCEPTION_REMEDIATE_PREREQ');
    expect(rec.kind === 'interactive' && rec.skillId).toBe(COUNT);
  });

  it('scenario 3: correct answers after a hint do not count as independent mastery', () => {
    const l = new Learner();
    for (let i = 0; i < 12; i++) {
      l.answer({ ...ok(BONDS, i % 2 ? 'number-bond' : 'make-ten-frame'), hintsUsed: 1 });
    }
    const s = l.mastery.get(BONDS)!;
    expect(s.independentCorrect).toBe(0);
    expect(s.score).toBeGreaterThanOrEqual(0.8);
    expect(masteryStatus(s, at(9999))).toBe('in_progress');
  });

  it('a second try after a mistake is "supported", not independent', () => {
    const l = new Learner();
    l.answer({ ...ok(BONDS, 'make-ten-frame'), tryNumber: 2 });
    expect(l.mastery.get(BONDS)!.independentCorrect).toBe(0);
    expect(l.rules.at(-1)).toContain('M3_SUPPORTED_CORRECT');
  });

  it('mastery needs score ≥ 0.8, ≥3 independent correct in ≥2 formats AND a delayed check', () => {
    const l = new Learner();
    for (let i = 0; i < 5; i++) l.answer(ok(BONDS, 'make-ten-frame'));
    expect(masteryStatus(l.mastery.get(BONDS), at(10))).toBe('in_progress'); // only one format
    l.answer(ok(BONDS, 'number-bond'));
    const s = l.mastery.get(BONDS)!;
    expect(s.phase).toBe('secure');
    expect(masteryStatus(s, at(10))).toBe('secure');
    expect(masteryStatus(s, at(60 * 21))).toBe('review_due');
  });

  it('scenario 10: delayed review after prior success tests retention rather than assuming mastery', () => {
    const l = new Learner();
    for (const f of ['make-ten-frame', 'number-bond', 'make-ten-frame', 'number-bond', 'bond-equation']) l.answer(ok(BONDS, f));
    for (const f of ['count-ten-frame', 'count-scattered', 'count-ten-frame', 'count-scattered']) l.answer(ok(COUNT, f));
    const dueAt = at(60 * 24);
    const rec = recommendNext(l.input(dueAt));
    expect(rec.kind === 'interactive' && rec.ruleId).toBe('R4_DUE_REVIEW');
    // Lapse: a wrong answer at the check sends the skill back to learning — not mastered.
    const lapsed = updateMastery(l.mastery.get(BONDS)!, { ...ok(BONDS, 'number-bond'), correct: false, at: dueAt });
    expect(lapsed.rules).toContain('M7_DELAYED_CHECK_LAPSED');
    expect(masteryStatus(lapsed.state, dueAt)).toBe('in_progress');
    // Pass: an independent correct at the check confirms mastery and schedules spaced review.
    const passed = updateMastery(l.mastery.get(BONDS)!, { ...ok(BONDS, 'number-bond'), at: dueAt });
    expect(passed.rules).toContain('M6_DELAYED_CHECK_PASSED');
    expect(masteryStatus(passed.state, dueAt)).toBe('mastered');
    expect(new Date(passed.state.nextReviewAt!).getTime()).toBe(dueAt.getTime() + 3 * 86_400_000);
  });

  it('hint-supported success at the delayed check keeps the check due', () => {
    const l = new Learner();
    for (const f of ['make-ten-frame', 'number-bond', 'make-ten-frame', 'number-bond', 'bond-equation']) l.answer(ok(BONDS, f));
    const dueAt = at(60 * 24);
    const u = updateMastery(l.mastery.get(BONDS)!, { ...ok(BONDS, 'number-bond'), hintsUsed: 2, at: dueAt });
    expect(masteryStatus(u.state, dueAt)).toBe('review_due');
  });

  it('rapid success: a new learner starts with counting, then bonds unlock once counting is secure', () => {
    const l = new Learner();
    const first = recommendNext(l.input(at(0)));
    expect(first.kind === 'interactive' && first.skillId).toBe(COUNT);
    expect(first.kind === 'interactive' && first.ruleId).toBe('R6_NEXT_UNLOCKED');
    expect(first.kind === 'interactive' && first.cpaStage).toBe('concrete');
    for (const f of ['count-ten-frame', 'count-scattered', 'count-ten-frame', 'count-scattered']) l.answer(ok(COUNT, f));
    const next = recommendNext(l.input(at(10)));
    expect(next.kind === 'interactive' && next.skillId).toBe(BONDS);
  });

  it('CPA progresses concrete → pictorial → abstract with evidence', () => {
    const l = new Learner();
    for (const f of ['count-ten-frame', 'count-scattered', 'count-ten-frame', 'count-scattered']) l.answer(ok(COUNT, f));
    const r0 = recommendNext(l.input(at(10)));
    expect(r0.kind === 'interactive' && r0.cpaStage).toBe('concrete');
    l.answer({ ...ok(BONDS, 'make-ten-frame'), hintsUsed: 1 });
    const r1 = recommendNext(l.input(at(11)));
    expect(r1.kind === 'interactive' && r1.cpaStage).toBe('pictorial');
    l.answer(ok(BONDS, 'number-bond'));
    l.answer(ok(BONDS, 'number-bond'));
    const r2 = recommendNext(l.input(at(12)));
    expect(r2.kind === 'interactive' && r2.cpaStage).toBe('abstract');
  });

  it('parent focus is honoured and never jumps grade bands', () => {
    const l = new Learner();
    const rec = recommendNext(l.input(at(0), BONDS));
    expect(rec.kind === 'interactive' && rec.ruleId).toBe('R3_PARENT_FOCUS');
    const bogus = recommendNext(l.input(at(0), 'TOD-SORT-COLOR'));
    expect(bogus.kind === 'interactive' && bogus.skillId).toBe(COUNT);
  });

  it('under-3 safety band never receives interactive work', () => {
    const l = new Learner();
    const input = { ...l.input(at(0)), policy: safetyPolicy(exactCalendarAge('2024-05-20', '2026-11-10'), 'ELEMENTARY_GUIDED') };
    expect(recommendNext(input).ruleId).toBe('R0_SAFETY_OFFLINE_ONLY');
  });

  it('no reviewed lessons → no recommendation (unreviewed content is never used)', () => {
    const l = new Learner();
    expect(recommendNext({ ...l.input(at(0)), lessons: [] }).kind).toBe('none');
  });

  it('lesson choices offer the recommendation first plus unlocked alternatives only', () => {
    const l = new Learner();
    const input = l.input(at(0));
    const choices = lessonChoices(input, recommendNext(input));
    expect(choices[0]?.skillId).toBe(COUNT);
    expect(choices.every((c) => c.skillId === COUNT)).toBe(true);
  });
});

describe('offline card recommendations', () => {
  it('suggests varied skills, least recently observed first', () => {
    const cards = getCatalog().lessons.filter((l) => l.mode === 'offline');
    const recent = [{ lessonId: 'lesson-tod-lang-001', skillId: 'TOD-LANG-NAME', observedAt: T0 }];
    const ids = recommendOfflineCards(cards as never, recent, 3);
    expect(ids).toHaveLength(3);
    const skills = ids.map((id) => cards.find((c) => c.id === id)!.skillId);
    expect(new Set(skills).size).toBe(3);
    expect(skills).not.toContain('TOD-LANG-NAME');
  });
});
