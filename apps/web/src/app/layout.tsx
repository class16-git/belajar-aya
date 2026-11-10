import type { Metadata, Viewport } from 'next';
import './globals.css';
import { currentLocale } from '@/lib/server/guards';
import { getDictionary } from '@/lib/i18n';
import { I18nProvider } from '@/lib/i18n/client';

export const metadata: Metadata = {
  title: { default: 'Atlas — Family Learning', template: '%s · Atlas' },
  description: 'A calm, private learning space for families.',
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#FAF6EF' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await currentLocale();
  const t = getDictionary(locale);
  return (
    <html lang={locale}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-soft">
          {t.app.skip}
        </a>
        <I18nProvider t={t} locale={locale}>
          {children}
        </I18nProvider>
        <footer className="no-print mx-auto max-w-6xl px-4 pb-6 pt-2 text-center text-xs text-muted" data-testid="credit">
          {t.app.credit}
        </footer>
      </body>
    </html>
  );
}
