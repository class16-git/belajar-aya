'use client';
import { createContext, useContext, type ReactNode } from 'react';
import type { Locale } from '@atlas/shared';
import type { Dictionary } from './en';

const Ctx = createContext<{ t: Dictionary; locale: Locale } | null>(null);

export function I18nProvider({ t, locale, children }: { t: Dictionary; locale: Locale; children: ReactNode }) {
  return <Ctx.Provider value={{ t, locale }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error('I18nProvider missing');
  return v;
}
