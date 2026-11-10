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

  it('parent focus cannot unlock prerequisites (Curriculum Bible adaptive rule 4)', () => {
    const l = new Learner();
    // Counting is not secure yet: focusing on number bonds must not skip it.
    const locked = recommendNext(l.input(at(0), BONDS));
    expect(locked.kind === 'interactive' && locked.ruleId).toBe('R6_NEXT_UNLOCKED');
    expect(locked.kind === 'interactive' && locked.skillId).toBe(COUNT);
  });

  it('parent focus is honoured once prerequisites are secure, and never jumps grade bands', () => {
    const l = new Learner();
    for (const f of ['count-ten-frame', 'count-scattered', 'count-ten-frame', 'count-scattered']) l.answer(ok(COUNT, f));
    const rec = recommendNext(l.input(at(10), BONDS));
    expect(rec.kind === 'interactive' && rec.ruleId).toBe('R3_PARENT_FOCUS');
    const bogus = recommendNext(l.input(at(10), 'TOD-SORT-COLOR'));
    expect(bogus.kind).toBe('interactive');
    if (bogus.kind === 'interactive') {
      expect(bogus.ruleId).not.toBe('R3_PARENT_FOCUS');
      expect(bogus.skillId.startsWith('MATH-G1-')).toBe(true);
    }
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

describe('slice B golden traces: addition & subtraction within 10, bar-model stories', () => {
  const ADD = 'MATH-G1-ADD-10';
  const SUB = 'MATH-G1-SUB-10';
  const WORD = 'MATH-G1-WORD-1';
  const secureCountAndBonds = (l: Learner) => {
    for (const f of ['count-ten-frame', 'count-scattered', 'count-ten-frame', 'count-scattered']) l.answer(ok(COUNT, f));
    for (const f of ['make-ten-frame', 'number-bond', 'make-ten-frame', 'number-bond']) l.answer(ok(BONDS, f));
  };

  it('once number bonds are secure, addition unlocks and starts with concrete counters', () => {
    const l = new Learner();
    secureCountAndBonds(l);
    const rec = recommendNext(l.input(at(20)));
    expect(rec.kind).toBe('interactive');
    if (rec.kind !== 'interactive') return;
    expect(rec.ruleId).toBe('R6_NEXT_UNLOCKED');
    expect(rec.skillId).toBe(ADD);
    expect(rec.lessonId).toBe('lesson-g1-add-10-001');
    expect(rec.cpaStage).toBe('concrete');
  });

  it('addition becomes secure only with independent success in two formats (counters + bond)', () => {
    const l = new Learner();
    secureCountAndBonds(l);
    for (let i = 0; i < 5; i++) l.answer(ok(ADD, 'add-counters'));
    expect(masteryStatus(l.mastery.get(ADD), at(30))).toBe('in_progress');
    l.answer(ok(ADD, 'add-bond'));
    expect(masteryStatus(l.mastery.get(ADD), at(30))).toBe('secure');
  });

  it('story problems stay locked until BOTH addition and subtraction are secure — parent focus cannot skip this', () => {
    const l = new Learner();
    secureCountAndBonds(l);
    for (const f of ['add-counters', 'add-bond', 'add-counters', 'add-bond']) l.answer(ok(ADD, f));
    const focused = recommendNext(l.input(at(30), WORD));
    expect(focused.kind === 'interactive' && focused.ruleId).not.toBe('R3_PARENT_FOCUS');
    expect(focused.kind === 'interactive' && focused.skillId).toBe(SUB);
    for (const f of ['sub-takeaway', 'sub-bond', 'sub-takeaway', 'sub-bond']) l.answer(ok(SUB, f));
    const now = recommendNext(l.input(at(40), WORD));
    expect(now.kind === 'interactive' && now.ruleId).toBe('R3_PARENT_FOCUS');
    expect(now.kind === 'interactive' && now.lessonId).toBe('lesson-g1-word-1-001');
  });

  it('adding-and-taking-away stories give two formats, so one story lesson can reach secure', () => {
    const l = new Learner();
    for (const f of ['bar-model-story:add', 'bar-model-story:sub', 'bar-model-story:add', 'bar-model-story:sub', 'bar-model-story:add']) l.answer(ok(WORD, f));
    expect(l.mastery.get(WORD)!.formats).toEqual(['bar-model-story:add', 'bar-model-story:sub']);
    expect(masteryStatus(l.mastery.get(WORD), at(10))).toBe('secure');
  });

  it('repeated "added instead of subtracting" in stories routes back to subtraction while it is weak', () => {
    const l = new Learner();
    secureCountAndBonds(l);
    for (const f of ['add-counters', 'add-bond', 'add-counters', 'add-bond']) l.answer(ok(ADD, f));
    for (const f of ['sub-takeaway', 'sub-bond', 'sub-takeaway', 'sub-bond']) l.answer(ok(SUB, f));
    // Subtraction drops back below secure after a lapse at its delayed check.
    l.answer({ ...ok(SUB, 'sub-bond'), correct: false, misconception: 'WRONG_OPERATION', at: at(60 * 24) });
    expect(masteryStatus(l.mastery.get(SUB), at(60 * 24))).toBe('in_progress');
    l.answer({ ...ok(WORD, 'bar-model-story:sub'), correct: false, misconception: 'WRONG_OPERATION', at: at(60 * 24 + 1) });
    l.answer({ ...ok(WORD, 'bar-model-story:sub'), correct: false, misconception: 'WRONG_OPERATION', at: at(60 * 24 + 2) });
    const rec = recommendNext(l.input(at(60 * 24 + 3)));
    expect(rec.kind === 'interactive' && rec.ruleId).toBe('R2_MISCONCEPTION_REMEDIATE_PREREQ');
    expect(rec.kind === 'interactive' && rec.skillId).toBe(SUB);
    expect(rec.kind === 'interactive' && rec.cpaStage).toBe('concrete');
    expect(rec.kind === 'interactive' && rec.reason.en).toMatch(/WRONG_OPERATION/);
  });
});

describe('slice D golden traces: Grade 1 robotics (trace and debug)', () => {
  const ROBO = 'MATH-G1-COUNT-20';
  it('robot activities join the choices once counting is secure, tracing first, and need both formats to be secure', () => {
    const l = new Learner();
    const fresh = lessonChoices(l.input(at(0)), recommendNext(l.input(at(0))));
    expect(fresh.some((c) => c.skillId === 'ROBO-G1-DEBUG')).toBe(false);
    for (const f of ['count-ten-frame', 'count-scattered', 'count-ten-frame', 'count-scattered']) l.answer(ok(ROBO, f));
    const focused = recommendNext(l.input(at(10), 'ROBO-G1-DEBUG'));
    expect(focused.kind === 'interactive' && focused.ruleId).toBe('R3_PARENT_FOCUS');
    expect(focused.kind === 'interactive' && focused.lessonId).toBe('lesson-robo-g1-trace-001');
    for (let i = 0; i < 5; i++) l.answer(ok('ROBO-G1-DEBUG', 'robot-trace'));
    expect(masteryStatus(l.mastery.get('ROBO-G1-DEBUG'), at(20))).toBe('in_progress');
    l.answer(ok('ROBO-G1-DEBUG', 'robot-debug'));
    expect(masteryStatus(l.mastery.get('ROBO-G1-DEBUG'), at(20))).toBe('secure');
  });
});

describe('Kindergarten: Kindergarten skills plus Grade 1 number sense', () => {
  it('a K learner starts with counting; teen numbers unlock after counting, bonds to 20 after bonds to 10 and teens', () => {
    const l = new Learner();
    const k = (now: Date, focus: string | null = null) => ({ ...l.input(now, focus), band: 'kindergarten' as const, bands: ['kindergarten' as const, 'g1' as const] });
    const first = recommendNext(k(at(0)));
    expect(first.kind === 'interactive' && first.skillId).toBe(COUNT);
    expect(lessonChoices(k(at(0)), first).every((c) => c.skillId === COUNT)).toBe(true);
    for (const f of ['count-ten-frame', 'count-scattered', 'count-ten-frame', 'count-scattered']) l.answer(ok(COUNT, f));
    const teens = recommendNext(k(at(10), 'K-MATH-TEENS'));
    expect(teens.kind === 'interactive' && teens.ruleId).toBe('R3_PARENT_FOCUS');
    expect(teens.kind === 'interactive' && teens.lessonId).toBe('lesson-k-teens-001');
    const locked = recommendNext(k(at(10), 'K-MATH-BONDS-20'));
    expect(locked.kind === 'interactive' && locked.skillId).not.toBe('K-MATH-BONDS-20');
    // A Grade 1 learner never sees Kindergarten-only skills.
    expect(lessonChoices(l.input(at(10)), recommendNext(l.input(at(10)))).some((c) => c.skillId.startsWith('K-'))).toBe(false);
  });
});

describe('lesson choices show variety', () => {
  it('after counting is secure: the suggestion, then one lesson from each other unlocked skill (unfinished first)', () => {
    const l = new Learner();
    for (const f of ['count-ten-frame', 'count-scattered', 'count-ten-frame', 'count-scattered']) l.answer(ok(COUNT, f));
    const input = l.input(at(10));
    const choices = lessonChoices(input, recommendNext(input));
    expect(choices[0]!.skillId).toBe(BONDS);
    expect(new Set(choices.map((c) => c.skillId)).size).toBe(choices.length); // no skill repeated while others are available
    expect(choices.map((c) => c.skillId)).toContain('ROBO-G1-DEBUG');
    expect(choices.at(-1)!.skillId).toBe(COUNT); // already-secure skill comes last
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
