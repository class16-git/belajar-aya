import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Logo } from '@/components/ui/brand';
import { LanguageSwitch } from '@/components/ui/language-switch';
import { getDictionary } from '@/lib/i18n';
import { currentLocale } from '@/lib/server/guards';
import { getAuth } from '@/lib/server/session';

export default async function Home() {
  const auth = await getAuth();
  if (auth) redirect(auth.session.childModeChildId ? '/learn' : '/family');
  const t = getDictionary(await currentLocale());
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Logo />
        <LanguageSwitch />
      </header>
      <main id="main" className="mx-auto grid max-w-5xl gap-10 px-4 pb-16 pt-6 md:grid-cols-[1.2fr_1fr] md:items-center">
        <section>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{t.landing.heading}</h1>
          <p className="mt-4 max-w-prose text-lg text-muted">{t.landing.body}</p>
          <ul className="mt-6 space-y-3">
            {t.landing.points.map((p) => (
              <li key={p} className="flex gap-3">
                <span aria-hidden="true" className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sage" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary btn-xl">{t.landing.createAccount}</Link>
            <Link href="/signin" className="btn-secondary btn-xl">{t.landing.signIn}</Link>
          </div>
          <p className="mt-8 max-w-prose text-sm text-muted">{t.landing.disclaimer}</p>
        </section>
        <section aria-hidden="true" className="card hidden md:block">
          <HeroIllustration />
        </section>
      </main>
    </div>
  );
}

function HeroIllustration() {
  const filled = 7;
  return (
    <svg viewBox="0 0 320 220" className="h-auto w-full">
      <rect x="10" y="20" width="300" height="124" rx="16" fill="#F1EADF" />
      {Array.from({ length: 10 }, (_, i) => {
        const x = 22 + (i % 5) * 57;
        const y = 32 + Math.floor(i / 5) * 54;
        return (
          <g key={i}>
            <rect x={x} y={y} width="50" height="48" rx="10" fill="#fff" stroke="#E4D8C6" strokeWidth="2" />
            {i < filled && <circle cx={x + 25} cy={y + 24} r="15" fill={i < 5 ? '#B5443A' : '#3D6A8C'} />}
          </g>
        );
      })}
      <circle cx="160" cy="175" r="22" fill="#fff" stroke="#5B4636" strokeWidth="3" />
      <text x="160" y="183" textAnchor="middle" fontSize="22" fontWeight="700" fill="#2E2620">10</text>
      <line x1="145" y1="190" x2="115" y2="200" stroke="#5B4636" strokeWidth="3" />
      <line x1="175" y1="190" x2="205" y2="200" stroke="#5B4636" strokeWidth="3" />
      <circle cx="100" cy="204" r="14" fill="#fff" stroke="#5B4636" strokeWidth="3" />
      <text x="100" y="210" textAnchor="middle" fontSize="16" fontWeight="700" fill="#2E2620">7</text>
      <circle cx="220" cy="204" r="14" fill="#fff" stroke="#B5643C" strokeWidth="3" strokeDasharray="4 3" />
      <text x="220" y="210" textAnchor="middle" fontSize="16" fontWeight="700" fill="#B5643C">?</text>
    </svg>
  );
}
