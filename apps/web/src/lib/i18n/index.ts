import type { Locale } from '@atlas/shared';
import { en, type Dictionary } from './en';
import { id } from './id';

export type { Dictionary };
export const dictionaries: Record<Locale, Dictionary> = { en, id };
export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];

/** Replace {name} placeholders. */
/** Display label for a stored school grade (stored values are stable English keys). */
export function gradeLabel(t: Dictionary, grade: string | null): string {
  if (!grade) return '';
  return (t.child.grades as Record<string, string>)[grade] ?? grade;
}

export function fmt(template: string, params: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m));
}
