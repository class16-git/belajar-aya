import type { ReactNode } from 'react';
import { Logo } from '@/components/ui/brand';
import { GrownUpsButton } from './exit-dialog';

export function ChildShell({ reducedMotion, children }: { reducedMotion: boolean; children: ReactNode }) {
  return (
    <div className={`child-mode min-h-screen ${reducedMotion ? 'reduce-motion' : ''}`}>
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Logo />
        <GrownUpsButton />
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 pb-10">{children}</main>
    </div>
  );
}
