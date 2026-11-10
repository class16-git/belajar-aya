'use client';
import { useI18n } from '@/lib/i18n/client';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const { t } = useI18n();
  return (
    <main id="main" className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="h1">{t.app.error}</h1>
      <button type="button" onClick={reset} className="btn-primary mt-6">{t.learn.tryAgain}</button>
    </main>
  );
}
