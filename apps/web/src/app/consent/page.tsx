import { CONSENT_VERSION } from '@atlas/shared';
import { redirect } from 'next/navigation';
import { ConsentForm } from '@/components/forms/consent-form';
import { ParentShell } from '@/components/ui/parent-shell';
import { getDictionary } from '@/lib/i18n';
import { currentLocale, hasConsent, requireParentPage } from '@/lib/server/guards';

export const metadata = { title: 'Consent' };

export default async function ConsentPage() {
  const auth = await requireParentPage({ allowNoConsent: true });
  if (hasConsent(auth)) redirect('/family');
  const t = getDictionary(await currentLocale());
  return (
    <ParentShell t={t}>
      <div className="card mx-auto max-w-2xl space-y-5">
        <h1 className="h1">{t.consent.title}</h1>
        <p>{t.consent.intro}</p>
        <ul className="list-disc space-y-2 pl-6">
          {t.consent.items.map((i) => <li key={i}>{i}</li>)}
        </ul>
        <p className="text-sm muted">{t.consent.version}: {CONSENT_VERSION}. {t.consent.legalNote}</p>
        <ConsentForm version={CONSENT_VERSION} />
      </div>
    </ParentShell>
  );
}
