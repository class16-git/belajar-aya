import { describe, expect, it } from 'vitest';
import { en } from './en';
import { id } from './id';
import { fmt } from './index';

type Tree = { [k: string]: unknown };
const shape = (o: unknown, p = ''): string[] =>
  typeof o === 'string'
    ? [`${p}:${(o.match(/\{\w+\}/g) ?? []).sort().join(',')}`]
    : Array.isArray(o)
      ? [`${p}[${o.length}]`]
      : Object.entries(o as Tree).flatMap(([k, v]) => shape(v, p ? `${p}.${k}` : k));

describe('i18n', () => {
  it('Bahasa Indonesia has exactly the same keys and placeholders as English', () => {
    expect(shape(id)).toEqual(shape(en));
  });
  it('no empty strings in either locale', () => {
    const strings = (o: unknown): string[] => (typeof o === 'string' ? [o] : Object.values(o as Tree).flatMap(strings));
    for (const s of [...strings(en), ...strings(id)]) expect(s.trim().length).toBeGreaterThan(0);
  });
  it('avoids shaming language in child feedback', () => {
    const child = JSON.stringify([en.learn, id.learn]).toLowerCase();
    for (const bad of [/\bwrong!/, /\btoo slow\b/, /\bsalah!/, /\bterlalu lambat\b/, /\brank(ing)?\b/, /\bstreaks?\b/, /\bperingkat\b/]) expect(child).not.toMatch(bad);
  });
  it('fmt fills placeholders and leaves unknown ones intact', () => {
    expect(fmt('Hello, {name}! {x}', { name: 'A' })).toBe('Hello, A! {x}');
  });
});
