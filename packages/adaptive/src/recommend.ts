import type { CpaStage, LocalizedText, SafetyPolicy } from '@atlas/shared';
import type { InteractiveLesson, OfflineCard, Skill } from '@atlas/curriculum';
import type { Difficulty } from '@atlas/assessment';
import { isIndependent, masteryStatus, unlocksDependants, type Evidence, type MasteryState } from './mastery';

export const RECOMMENDER_VERSION = 'recommender-2026.11.1';

export type RuleId =
  | 'R0_SAFETY_OFFLINE_ONLY'
  | 'R2_MISCONCEPTION_REMEDIATE_PREREQ'
  | 'R2_MISCONCEPTION_REMEDIATE_CONCRETE'
  | 'R3_PARENT_FOCUS'
  | 'R4_DUE_REVIEW'
  | 'R5_ACTIVE_OBJECTIVE'
  | 'R6_NEXT_UNLOCKED'
  | 'R7_ALL_SECURE_PRACTICE'
  | 'R9_NO_ELIGIBLE_CONTENT';

export interface InteractiveRecommendation {
  kind: 'interactive';
  skillId: string;
  lessonId: string;
  cpaStage: CpaStage;
  difficulty: Difficulty;
  ruleId: RuleId;
  reason: LocalizedText;
}
export interface OfflineRecommendation {
  kind: 'offline';
  cardIds: string[];
  ruleId: RuleId;
  reason: LocalizedText;
}
export interface NoRecommendation {
  kind: 'none';
  ruleId: 'R9_NO_ELIGIBLE_CONTENT';
  reason: LocalizedText;
}
export type Recommendation = InteractiveRecommendation | OfflineRecommendation | NoRecommendation;

export interface RecommendInput {
  now: Date;
  policy: SafetyPolicy;
  /** Parent-approved band for interactive content (grade is parent-controlled, never inferred). */
  band: Skill['band'];
  skills: Skill[];
  lessons: InteractiveLesson[]; // already filtered to visible/reviewed
  mastery: Map<string, MasteryState>;
  /** Most recent first. */
  recentEvidence: Evidence[];
  focusSkillId: string | null;
}

const STAGE_ORDER: CpaStage[] = ['concrete', 'pictorial', 'abstract'];

function lessonFor(lessons: InteractiveLesson[], skillId: string, stage: CpaStage): InteractiveLesson | undefined {
  const forSkill = lessons.filter((l) => l.skillId === skillId);
  const exact = forSkill.find((l) => l.cpaStage === stage);
  if (exact) return exact;
  // Fall back towards concrete first (safer), then upwards.
  const idx = STAGE_ORDER.indexOf(stage);
  for (let i = idx - 1; i >= 0; i--) {
    const l = forSkill.find((x) => x.cpaStage === STAGE_ORDER[i]);
    if (l) return l;
  }
  return forSkill.find((x) => STAGE_ORDER.indexOf(x.cpaStage) > idx);
}

/** CPA choice: concrete when new/misunderstood, pictorial after supported success, abstract after robust independent success. */
export function chooseStage(state: MasteryState | undefined, evidence: Evidence[]): CpaStage {
  const last = evidence[0];
  if (!state || state.attempts === 0 || !last) return 'concrete';
  if (state.consecutiveIndependentCorrect >= 2 && state.score >= 0.6) return 'abstract';
  if (last.correct) return 'pictorial';
  return 'concrete';
}

export function chooseDifficulty(state: MasteryState | undefined): Difficulty {
  if (!state) return 1;
  if (state.score < 0.5) return 1;
  if (state.score < 0.7) return 2;
  return 3;
}

/** A misconception code repeated at least twice in the last 5 attempts on a skill. */
export function repeatedMisconception(evidence: Evidence[], skillId: string): string | null {
  const recent = evidence.filter((e) => e.skillId === skillId).slice(0, 5);
  // Only count errors after the most recent independent success.
  const sinceSuccess: Evidence[] = [];
  for (const e of recent) {
    if (isIndependent(e)) break;
    sinceSuccess.push(e);
  }
  const counts = new Map<string, number>();
  for (const e of sinceSuccess) {
    if (!e.correct && e.misconception && e.misconception !== 'UNCLASSIFIED') {
      counts.set(e.misconception, (counts.get(e.misconception) ?? 0) + 1);
    }
  }
  for (const [code, n] of counts) if (n >= 2) return code;
  return null;
}

const R = (en: string, id: string): LocalizedText => ({ en, id });

export function recommendNext(input: RecommendInput): Recommendation {
  const { policy, skills, lessons, mastery, recentEvidence, now } = input;
  if (!policy.childScreenActivitiesAllowed) {
    return {
      kind: 'offline',
      cardIds: [],
      ruleId: 'R0_SAFETY_OFFLINE_ONLY',
      reason: R(
        'Caregiver-led offline activities are recommended for this learner.',
        'Kegiatan luring yang dipandu orang tua disarankan untuk anak ini.',
      ),
    };
  }
  const eligible = skills
    .filter((s) => s.band === input.band && s.evidence === 'digital_attempts')
    .filter((s) => lessons.some((l) => l.skillId === s.id))
    .sort((a, b) => a.order - b.order);
  if (eligible.length === 0) {
    return { kind: 'none', ruleId: 'R9_NO_ELIGIBLE_CONTENT', reason: R('No reviewed activities are available yet.', 'Belum ada kegiatan yang sudah ditinjau.') };
  }
  const byId = new Map(skills.map((s) => [s.id, s]));
  const evFor = (id: string) => recentEvidence.filter((e) => e.skillId === id);
  const prereqsSatisfied = (s: Skill) => s.prerequisites.every((p) => unlocksDependants(mastery.get(p)));

  const make = (skill: Skill, ruleId: RuleId, reason: LocalizedText, forceConcrete = false, review = false): Recommendation | null => {
    const st = mastery.get(skill.id);
    let stage = forceConcrete ? 'concrete' : chooseStage(st, evFor(skill.id));
    if (review) stage = 'pictorial'; // retention check uses a fresh representation, not the last practised one
    const lesson = lessonFor(lessons, skill.id, stage);
    if (!lesson) return null;
    const difficulty: Difficulty = forceConcrete ? 1 : review ? 2 : chooseDifficulty(st);
    return { kind: 'interactive', skillId: skill.id, lessonId: lesson.id, cpaStage: lesson.cpaStage, difficulty, ruleId, reason };
  };

  // R2: repeated misconception on the most recently practised skill → concrete/prerequisite, never harder work.
  const lastSkillId = recentEvidence[0]?.skillId;
  const lastSkill = lastSkillId ? byId.get(lastSkillId) : undefined;
  if (lastSkill && eligible.includes(lastSkill)) {
    const code = repeatedMisconception(recentEvidence, lastSkill.id);
    if (code) {
      const weakPrereq = lastSkill.prerequisites
        .map((p) => byId.get(p))
        .find((p): p is Skill => !!p && eligible.includes(p) && !unlocksDependants(mastery.get(p.id)));
      if (weakPrereq) {
        const r = make(weakPrereq, 'R2_MISCONCEPTION_REMEDIATE_PREREQ', R(
          `Repeated ${code} on ${lastSkill.title.en}; strengthening the prerequisite ${weakPrereq.title.en} with concrete materials.`,
          `${code} berulang pada ${lastSkill.title.id}; memperkuat prasyarat ${weakPrereq.title.id} dengan benda konkret.`,
        ), true);
        if (r) return r;
      }
      const r = make(lastSkill, 'R2_MISCONCEPTION_REMEDIATE_CONCRETE', R(
        `Repeated ${code}; returning to concrete practice on ${lastSkill.title.en} at an easier level.`,
        `${code} berulang; kembali ke latihan konkret ${lastSkill.title.id} pada tingkat lebih mudah.`,
      ), true);
      if (r) return r;
    }
  }

  // R3: parent focus (preference) when the skill is eligible and unlocked.
  const focus = input.focusSkillId ? byId.get(input.focusSkillId) : undefined;
  if (focus && eligible.includes(focus)) {
    const r = make(focus, 'R3_PARENT_FOCUS', R(`Parent chose to focus on ${focus.title.en}.`, `Orang tua memilih fokus pada ${focus.title.id}.`), false, masteryStatus(mastery.get(focus.id), now) === 'review_due');
    if (r) return r;
  }

  // R4: due delayed checks / spaced reviews first.
  const due = eligible.filter((s) => masteryStatus(mastery.get(s.id), now) === 'review_due');
  if (due[0]) {
    const r = make(due[0], 'R4_DUE_REVIEW', R(
      `A delayed check is due for ${due[0].title.en} to confirm it is remembered.`,
      `Pemeriksaan tertunda untuk ${due[0].title.id} sudah waktunya, untuk memastikan masih diingat.`,
    ), false, true);
    if (r) return r;
  }

  // R5: continue one active objective (most recently practised in-progress skill with prerequisites met).
  const active = eligible
    .filter((s) => masteryStatus(mastery.get(s.id), now) === 'in_progress' && prereqsSatisfied(s))
    .sort((a, b) => (mastery.get(b.id)?.lastEvidenceAt ?? '').localeCompare(mastery.get(a.id)?.lastEvidenceAt ?? ''));
  if (active[0]) {
    const r = make(active[0], 'R5_ACTIVE_OBJECTIVE', R(`Continuing ${active[0].title.en}.`, `Melanjutkan ${active[0].title.id}.`));
    if (r) return r;
  }

  // R6: next unlocked objective in sequence.
  const next = eligible.find((s) => masteryStatus(mastery.get(s.id), now) === 'not_started' && prereqsSatisfied(s));
  if (next) {
    const r = make(next, 'R6_NEXT_UNLOCKED', R(
      next.prerequisites.length ? `Prerequisites are secure; starting ${next.title.en}.` : `Starting with ${next.title.en}.`,
      next.prerequisites.length ? `Prasyarat sudah kuat; memulai ${next.title.id}.` : `Memulai dengan ${next.title.id}.`,
    ));
    if (r) return r;
  }

  // R7: everything available is secure/mastered and nothing is due — light practice on the least recent.
  const practice = [...eligible].sort((a, b) => (mastery.get(a.id)?.lastEvidenceAt ?? '').localeCompare(mastery.get(b.id)?.lastEvidenceAt ?? ''))[0];
  if (practice) {
    const r = make(practice, 'R7_ALL_SECURE_PRACTICE', R(`Light practice on ${practice.title.en} until the next review is due.`, `Latihan ringan ${practice.title.id} sampai jadwal tinjauan berikutnya.`));
    if (r) return r;
  }
  return { kind: 'none', ruleId: 'R9_NO_ELIGIBLE_CONTENT', reason: R('No reviewed activities are available yet.', 'Belum ada kegiatan yang sudah ditinjau.') };
}

/** Choice set for the child's lesson selection: the recommendation plus a few unlocked alternatives. */
export function lessonChoices(input: RecommendInput, rec: Recommendation, max = 3): InteractiveLesson[] {
  if (rec.kind !== 'interactive') return [];
  const first = input.lessons.find((l) => l.id === rec.lessonId);
  const unlocked = input.lessons.filter((l) => {
    const skill = input.skills.find((s) => s.id === l.skillId);
    return !!skill && skill.band === input.band && skill.prerequisites.every((p) => unlocksDependants(input.mastery.get(p)));
  });
  const rest = unlocked.filter((l) => l.id !== rec.lessonId);
  return [...(first ? [first] : []), ...rest].slice(0, max);
}

export interface OfflineHistory {
  lessonId: string;
  skillId: string;
  observedAt: Date;
}

/** Toddler/offline: suggest cards from the least-recently observed skills, for variety. */
export function recommendOfflineCards(cards: OfflineCard[], history: OfflineHistory[], count = 3): string[] {
  const lastBySkill = new Map<string, number>();
  const lastByCard = new Map<string, number>();
  for (const h of history) {
    lastBySkill.set(h.skillId, Math.max(lastBySkill.get(h.skillId) ?? 0, h.observedAt.getTime()));
    lastByCard.set(h.lessonId, Math.max(lastByCard.get(h.lessonId) ?? 0, h.observedAt.getTime()));
  }
  const ranked = [...cards].sort(
    (a, b) =>
      (lastBySkill.get(a.skillId) ?? 0) - (lastBySkill.get(b.skillId) ?? 0) ||
      (lastByCard.get(a.id) ?? 0) - (lastByCard.get(b.id) ?? 0) ||
      a.id.localeCompare(b.id),
  );
  const out: string[] = [];
  const usedSkills = new Set<string>();
  for (const c of ranked) {
    if (out.length >= count) break;
    if (usedSkills.has(c.skillId)) continue;
    out.push(c.id);
    usedSkills.add(c.skillId);
  }
  for (const c of ranked) if (out.length < count && !out.includes(c.id)) out.push(c.id);
  return out;
}
