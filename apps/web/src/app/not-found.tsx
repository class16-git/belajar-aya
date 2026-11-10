import Link from 'next/link';
import { getDictionary } from '@/lib/i18n';
import { currentLocale } from '@/lib/server/guards';

export default async function NotFound() {
  const t = getDictionary(await currentLocale());
  return (
    <main id="main" className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="h1">{t.app.notFound}</h1>
      <Link href="/" className="btn-primary mt-6">{t.app.goHome}</Link>
    </main>
  );
}
