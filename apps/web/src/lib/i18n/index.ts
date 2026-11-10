import type { Locale } from '@atlas/shared';
import { en, type Dictionary } from './en';
import { id } from './id';

export type { Dictionary };
export const dictionaries: Record<Locale, Dictionary> = { en, id };
export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];

/** Replace {name} placeholders. */
export function fmt(template: string, params: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m));
}
