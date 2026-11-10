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
