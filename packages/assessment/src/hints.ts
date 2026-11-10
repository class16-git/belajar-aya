import { fillTemplate, type InteractiveLesson } from '@atlas/curriculum';
import type { Locale } from '@atlas/shared';
import type { Item } from './items';

export const MAX_HINT_LEVEL = 4;

export interface HintView {
  level: number; // H0..H4
  text: string;
  /** H2+: show the supporting representation (ten-frame / number bond). */
  showRepresentation: boolean;
  /** H4: the worked example is shown and a new analogous item follows. */
  workedExample: boolean;
}

export function hintFor(lesson: InteractiveLesson, item: Item, level: number, locale: Locale): HintView {
  const lv = Math.max(0, Math.min(MAX_HINT_LEVEL, level));
  const template = lesson.hintLadder[lv]?.[locale] ?? '';
  return {
    level: lv,
    text: fillTemplate(template, item.params as Record<string, number>),
    showRepresentation: lv >= 2,
    workedExample: lv === MAX_HINT_LEVEL,
  };
}
