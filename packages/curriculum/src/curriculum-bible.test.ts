import { describe, expect, it } from 'vitest';
import { RAW_LESSONS, RAW_OBJECTIVES, RAW_SKILLS } from './content-index';
import { getCatalog, validateContent, visibleInteractiveLessons } from './catalog';
import { coverage, coverageMatrix, reviewQueue } from './coverage';
import { isVisible, religiousIssues, requiresReligiousReview } from './publication';
import type { Lesson } from './schema';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const raw = (id: string) => clone(RAW_LESSONS.find((l) => (l as Lesson).id === id)) as Lesson;
const ISLM = 'lesson-islm-meal-adab-001';

describe('religious publication gate (Curriculum Bible governance)', () => {
  it('Islamic content is never visible to children while religious review is unverified — in any environment', () => {
    const l = getCatalog().lessons.find((x) => x.id === ISLM)!;
    expect(requiresReligiousReview(l)).toBe(true);
    for (const min of ['draft', 'agent_reviewed', 'reviewed', 'published'] as const) expect(isVisible(l, min)).toBe(false);
  });

  it('the agent cannot advance religious content beyond draft without human religious approval', () => {
    const l = raw(ISLM) as unknown as Record<string, unknown>;
    l.reviewStatus = 'agent_reviewed';
    const r = validateContent([...RAW_LESSONS.filter((x) => (x as Lesson).id !== ISLM), l], RAW_SKILLS, RAW_OBJECTIVES);
    expect(r.errors.join('\n')).toMatch(/religious content must stay draft/);
  });

  it('approval needs a scholar reviewer, a date, a translation reviewer for Arabic, and verified phrases', () => {
    const l = raw(ISLM);
    expect(religiousIssues(l).map((i) => i.message)).toEqual(['Religious review is unverified', 'Arabic phrases are not verified']);
    l.religiousReview = { ...l.religiousReview!, approvalStatus: 'approved' };
    expect(religiousIssues(l).map((i) => i.message)).toEqual(
      expect.arrayContaining(['Approved religious review needs scholarReviewer and reviewedAt', 'Arabic text needs a translation reviewer', 'Arabic phrases are not verified']),
    );
    l.religiousReview = { ...l.religiousReview!, scholarReviewer: 'AB', reviewedAt: '2026-11-10', translationReviewer: 'CD' };
    l.arabicPhrases = l.arabicPhrases.map((p) => ({ ...p, verified: true }));
    expect(religiousIssues(l)).toEqual([]);
    // Even with religious approval, normal content review (human) is still required before production.
    expect(isVisible(l, 'reviewed')).toBe(false);
    l.reviewStatus = 'reviewed';
    l.review = { agentChecks: [], reviewedBy: 'owner', reviewerRole: 'parent', reviewedAt: '2026-11-10' };
    expect(isVisible(l, 'reviewed')).toBe(true);
  });

  it('a religious lesson without any review record fails validation (fields may be null, never invented)', () => {
    const l = raw(ISLM) as unknown as Record<string, unknown>;
    delete l.religiousReview;
    const r = validateContent([l], RAW_SKILLS, RAW_OBJECTIVES);
    expect(r.errors.join('\n')).toMatch(/needs a religiousReview record/);
  });

  it('any lesson with Arabic text is routed to religious review, whatever its framework', () => {
    const l = raw('lesson-tod-lang-001');
    expect(requiresReligiousReview(l)).toBe(false);
    l.arabicPhrases = [{ arabic: 'سلام', transliteration: 'salam', meaning: { en: 'peace', id: 'damai' }, verified: false }];
    expect(requiresReligiousReview(l)).toBe(true);
    expect(isVisible(l, 'reviewed')).toBe(false);
  });
});

describe('objectives registry (age 2 → Grade 6)', () => {
  it('is valid, has 120 objectives across 10 stages and 4 frameworks', () => {
    const c = getCatalog();
    expect(c.objectives.length).toBe(120);
    expect(new Set(c.objectives.map((o) => o.stage)).size).toBe(10);
    expect(new Set(c.objectives.map((o) => o.framework)).size).toBe(4);
  });

  it('every Islamic objective requires religious review', () => {
    for (const o of getCatalog().objectives.filter((x) => x.framework === 'islamic_studies')) {
      expect(o.requiresReligiousReview).toBe(true);
      expect(o.reviewFlags).toContain('religious_content');
    }
  });

  const mutate = (fn: (files: { objectives: Record<string, unknown>[] }[]) => void) => {
    const files = clone(RAW_OBJECTIVES) as { objectives: Record<string, unknown>[] }[];
    fn(files);
    return validateContent(RAW_LESSONS, RAW_SKILLS, files).errors.join('\n');
  };

  it('rejects unknown prerequisites, later-stage prerequisites and cycles', () => {
    expect(mutate((f) => ((f[0]!.objectives[0]!.prerequisites as string[]) = ['math.g1.does-not-exist']))).toMatch(/unknown prerequisite/);
    expect(
      mutate((f) => {
        const math = f.find((x) => x.objectives.some((o) => o.id === 'math.g1.count-20'))!;
        (math.objectives.find((o) => o.id === 'math.g1.count-20')!.prerequisites as string[]).push('math.g2.numbers-1000');
      }),
    ).toMatch(/later stage/);
    expect(
      mutate((f) => {
        const math = f.find((x) => x.objectives.some((o) => o.id === 'math.g1.count-20'))!;
        (math.objectives.find((o) => o.id === 'math.g1.count-20')!.prerequisites as string[]).push('math.g1.bonds-10');
      }),
    ).toMatch(/cycle/);
  });

  it('rejects Islamic objectives that skip religious review and skills linked from the wrong band', () => {
    expect(
      mutate((f) => {
        const isl = f.find((x) => x.objectives.some((o) => o.framework === 'islamic_studies'))!;
        isl.objectives[0]!.requiresReligiousReview = false;
      }),
    ).toMatch(/always require religious review/);
    expect(
      mutate((f) => {
        const math = f.find((x) => x.objectives.some((o) => o.id === 'math.age2_3.more-less'))!;
        (math.objectives.find((o) => o.id === 'math.age2_3.more-less')!.implementation as { skillIds: string[] }).skillIds = ['MATH-G1-COUNT-20'];
      }),
    ).toMatch(/is in band g1, not toddler/);
  });
});

describe('coverage and review queue', () => {
  const rows = coverage(getCatalog());
  const status = (id: string) => rows.find((r) => r.objective.id === id)!.status;

  it('reflects what is really implemented and approved', () => {
    expect(status('math.g1.count-20')).toBe('published');
    expect(status('math.g1.bonds-10')).toBe('published');
    expect(status('mont.age2_3.match-sort')).toBe('published');
    expect(status('math.g1.add-sub-10')).toBe('published'); // slice B: approved by the owner on 2026-11-10
    expect(status('math.g1.word-problems-1')).toBe('published');
    expect(status('math.g1.add-sub-20')).toBe('planned');
    expect(status('islm.age2_3.bismillah-alhamdulillah')).toBe('awaiting_religious_review');
    expect(status('robo.age3_4.arrow-paths')).toBe('published');
  });

  it('matrix totals equal the registry', () => {
    const m = coverageMatrix(rows);
    const total = Object.values(m).flatMap((r) => Object.values(r)).reduce((s, c) => s + c.total, 0);
    expect(total).toBe(rows.length);
  });

  it('review queue names the reviewer each blocked lesson needs', () => {
    const q = reviewQueue(getCatalog());
    expect(q.find((x) => x.lesson.id === ISLM)!.needs).toEqual(['author', 'religious_review', 'content_review']);
    expect(q.some((x) => x.lesson.id === 'lesson-robo-arrows-001')).toBe(false); // owner-approved
    expect(q.some((x) => x.lesson.id === 'lesson-g1-count-20-001')).toBe(false);
  });
});

describe('slice B (Grade 1 addition & subtraction within 10, bar-model stories)', () => {
  const SLICE_B = ['lesson-g1-add-10-001', 'lesson-g1-add-10-002', 'lesson-g1-add-10-003', 'lesson-g1-sub-10-001', 'lesson-g1-sub-10-002', 'lesson-g1-sub-10-003', 'lesson-g1-word-1-001'];
  it('is visible in production only because a human review is recorded (owner approval, 2026-11-10)', () => {
    const cat = getCatalog();
    for (const id of SLICE_B) {
      const l = cat.lessons.find((x) => x.id === id);
      expect(l?.reviewStatus, id).toBe('reviewed');
      expect(l?.review.reviewedBy, id).toBe('owner');
    }
    const prod = visibleInteractiveLessons('reviewed').map((l) => l.id);
    for (const id of SLICE_B) expect(prod).toContain(id);
    // Removing the human record hides it again (fail closed).
    const l = structuredClone(cat.lessons.find((x) => x.id === SLICE_B[0])!);
    l.review = { agentChecks: [] };
    expect(isVisible(l, 'reviewed')).toBe(false);
  });
  it('covers concrete → pictorial → abstract for both operations and links to the bible objectives', () => {
    const cat = getCatalog();
    const stages = (skill: string) => cat.lessons.filter((l) => l.skillId === skill && l.mode === 'interactive').map((l) => l.cpaStage).sort();
    expect(stages('MATH-G1-ADD-10')).toEqual(['abstract', 'concrete', 'pictorial']);
    expect(stages('MATH-G1-SUB-10')).toEqual(['abstract', 'concrete', 'pictorial']);
    for (const id of SLICE_B) {
      const l = cat.lessons.find((x) => x.id === id)!;
      expect(l.objectiveIds.length, id).toBe(1);
      expect(l.mode === 'interactive' && l.offlineExtension.en.length > 20, id).toBe(true);
    }
  });
});

describe('slice A extension (age 3–4 caregiver-led cards)', () => {
  it('every non-Islamic age 3–4 objective has an agent-checked preschool card with safety notes and no choking hazard', () => {
    const cat = getCatalog();
    const objectives = cat.objectives.filter((o) => o.stage === 'age3_4' && o.framework !== 'islamic_studies');
    expect(objectives.length).toBe(10);
    for (const o of objectives) {
      const cards = cat.lessons.filter((l) => l.objectiveIds.includes(o.id) && l.mode === 'offline');
      expect(cards.length, o.id).toBeGreaterThanOrEqual(1);
      for (const c of cards) {
        if (c.mode !== 'offline') continue;
        expect(c.ageBand, c.id).toBe('preschool');
        expect(c.hazards.chokingRisk, c.id).toBe(false);
        expect(c.safetyNotes.length, c.id).toBeGreaterThanOrEqual(2);
        expect(c.reviewStatus, c.id).toBe('reviewed'); // owner-approved 2026-11-10
      }
    }
    expect(cat.lessons.filter((l) => l.id.startsWith('lesson-pre-')).every((l) => l.review.reviewedBy === 'owner')).toBe(true);
  });
});

describe('slice C (age 4–5 and Kindergarten caregiver-led cards)', () => {
  it('every non-Islamic age 4–5 and Kindergarten objective has a lesson or card; cards avoid choking hazards', () => {
    const cat = getCatalog();
    const objectives = cat.objectives.filter((o) => (o.stage === 'age4_5' || o.stage === 'k') && o.framework !== 'islamic_studies');
    const covered = objectives.filter((o) => cat.lessons.some((l) => l.objectiveIds.includes(o.id)));
    // Every objective is now covered; K bonds to 20 and teen numbers are on-screen lessons.
    expect(objectives.filter((o) => !covered.includes(o)).map((o) => o.id)).toEqual([]);
    for (const l of cat.lessons.filter((x) => x.ageBand === 'prek' || x.ageBand === 'kindergarten')) {
      if (l.mode === 'offline') expect(l.hazards.chokingRisk, l.id).toBe(false);
      else expect(['math.k.bonds-20', 'math.k.tens-ones-intro', 'math.k.picture-word-problems']).toContain(l.objectiveIds[0]);
      // Offline cards were owner-approved; on-screen K lessons await the owner's own review (no blanket approval).
      // Cards corrected after the audit (ATL-10) await a person's re-review; the rest are owner-approved.
      expect(l.reviewStatus, l.id).toBe('reviewed'); // the two audit-corrected cards were owner-approved on 2026-11-11
    }
  });
});
