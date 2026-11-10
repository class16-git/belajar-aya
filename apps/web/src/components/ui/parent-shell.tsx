import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Dictionary } from '@/lib/i18n';
import { Logo } from './brand';
import { LanguageSwitch } from './language-switch';
import { SignOutButton } from './sign-out';

export type NavKey = 'family' | 'dashboard' | 'cards' | 'curriculum' | 'privacy' | 'settings';

export function ParentShell({ t, active, children }: { t: Dictionary; active?: NavKey; children: ReactNode }) {
  const items: { key: NavKey; href: string; label: string }[] = [
    { key: 'family', href: '/family', label: t.nav.family },
    { key: 'dashboard', href: '/dashboard', label: t.nav.dashboard },
    { key: 'cards', href: '/cards', label: t.nav.cards },
    { key: 'curriculum', href: '/curriculum', label: t.nav.curriculum },
    { key: 'privacy', href: '/privacy', label: t.nav.privacy },
    { key: 'settings', href: '/settings', label: t.nav.settings },
  ];
  return (
    <div className="min-h-screen">
      <header className="no-print border-b border-sand bg-linen/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/family" className="rounded-lg focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-focus">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitch />
            <SignOutButton />
          </div>
        </div>
        <nav aria-label={t.nav.menu} className="mx-auto max-w-6xl overflow-x-auto px-2">
          <ul className="flex gap-1 pb-2">
            {items.map((i) => (
              <li key={i.key}>
                <Link
                  href={i.href}
                  aria-current={active === i.key ? 'page' : undefined}
                  className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-xl px-3 font-semibold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-focus ${active === i.key ? 'bg-white text-ink shadow-soft' : 'text-bark hover:bg-white/60'}`}
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
