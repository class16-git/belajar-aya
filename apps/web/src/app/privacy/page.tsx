import { prisma } from '@atlas/database';
import { DeleteFamily, RevokeConsent } from '@/components/forms/privacy-actions';
import { ParentShell } from '@/components/ui/parent-shell';
import { fmt, getDictionary } from '@/lib/i18n';
import { currentLocale, requireParentPage } from '@/lib/server/guards';

export const metadata = { title: 'Privacy' };

export default async function PrivacyPage() {
  const auth = await requireParentPage();
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const consent = await prisma.consentRecord.findFirst({ where: { familyId: auth.family.id, revokedAt: null }, orderBy: { grantedAt: 'desc' } });
  const df = new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-GB', { dateStyle: 'long' });
  return (
    <ParentShell t={t} active="privacy">
      <h1 className="h1">{t.privacy.title}</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card space-y-3" aria-labelledby="consent-h">
          <h2 id="consent-h" className="h2">{t.privacy.consentTitle}</h2>
          {consent && <p>{fmt(t.privacy.consentGiven, { v: consent.version, date: df.format(consent.grantedAt) })}</p>}
          <p className="text-sm muted">{t.privacy.revokeBody}</p>
          <RevokeConsent />
        </section>
        <section className="card space-y-3" aria-labelledby="export-h">
          <h2 id="export-h" className="h2">{t.privacy.exportTitle}</h2>
          <p>{t.privacy.exportBody}</p>
          <a href="/api/parent/export" className="btn-primary" download>{t.privacy.exportButton}</a>
        </section>
        <section className="card space-y-3" aria-labelledby="inv-h">
          <h2 id="inv-h" className="h2">{t.privacy.inventoryTitle}</h2>
          <ul className="list-disc space-y-1 pl-6">{t.privacy.inventory.map((i) => <li key={i}>{i}</li>)}</ul>
          <p className="text-sm muted">{t.privacy.backups}</p>
        </section>
        <section className="card space-y-3" aria-labelledby="ai-h">
          <h2 id="ai-h" className="h2">{t.privacy.aiTitle}</h2>
          <p>{t.privacy.aiBody}</p>
        </section>
        <section className="card space-y-3 border-2 border-clay lg:col-span-2" aria-labelledby="del-h">
          <h2 id="del-h" className="h2">{t.privacy.deleteTitle}</h2>
          <p>{t.privacy.deleteBody}</p>
          <DeleteFamily />
        </section>
      </div>
    </ParentShell>
  );
}
