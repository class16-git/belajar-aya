export const LOCALES = ['en', 'id'] as const;
export type Locale = (typeof LOCALES)[number];
export const isLocale = (v: unknown): v is Locale => v === 'en' || v === 'id';

/** Bilingual text. Every learner-facing string in content has both languages. */
export type LocalizedText = { en: string; id: string };

export const CHILD_MODES = ['TODDLER_OFFLINE', 'ELEMENTARY_GUIDED'] as const;
export type ChildMode = (typeof CHILD_MODES)[number];

export const AGE_BANDS = [
  'toddler',
  'preschool',
  'prek',
  'kindergarten',
  'g1',
  'g2',
  'g3',
  'g4',
  'g5',
  'g6',
] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export const CPA_STAGES = ['concrete', 'pictorial', 'abstract'] as const;
export type CpaStage = (typeof CPA_STAGES)[number];

/** Version of the parent consent / privacy notice. Bump when the notice changes. */
export const CONSENT_VERSION = '2026-11-v1';

/**
 * Curriculum stages of the Curriculum & Islamic Education Bible (age 2 → Grade 6), in teaching order.
 * Stages describe content readiness; they are never inferred from a birthday alone.
 */
export const STAGES = ['age2_3', 'age3_4', 'age4_5', 'k', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6'] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_TO_BAND: Record<Stage, AgeBand> = {
  age2_3: 'toddler',
  age3_4: 'preschool',
  age4_5: 'prek',
  k: 'kindergarten',
  g1: 'g1',
  g2: 'g2',
  g3: 'g3',
  g4: 'g4',
  g5: 'g5',
  g6: 'g6',
};

export const stageIndex = (s: Stage): number => STAGES.indexOf(s);

export const FRAMEWORKS = ['montessori', 'singapore_math', 'robotics_stem', 'islamic_studies'] as const;
export type Framework = (typeof FRAMEWORKS)[number];
