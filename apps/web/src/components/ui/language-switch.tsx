'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n/client';

export function LanguageSwitch() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <div role="group" aria-label={t.app.language} className="inline-flex rounded-xl border-2 border-sand bg-white p-0.5">
      {(['en', 'id'] as const).map((l) => (
        <button
          key={l}
          type="button"
          disabled={busy}
          aria-pressed={locale === l}
          lang={l}
          onClick={async () => {
            if (l === locale) return;
            setBusy(true);
            await api('/api/locale', { body: { locale: l } });
            router.refresh();
            setBusy(false);
          }}
          className={`min-h-10 min-w-11 rounded-lg px-3 text-sm font-semibold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-focus ${locale === l ? 'bg-bark text-white' : 'text-bark'}`}
        >
          {l === 'en' ? 'EN' : 'ID'}
          <span className="sr-only"> — {l === 'en' ? t.app.english : t.app.indonesian}</span>
        </button>
      ))}
    </div>
  );
}
