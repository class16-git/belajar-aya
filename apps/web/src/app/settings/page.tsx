import { PinForm } from '@/components/forms/pin-form';
import { LanguageSwitch } from '@/components/ui/language-switch';
import { ParentShell } from '@/components/ui/parent-shell';
import { getDictionary } from '@/lib/i18n';
import { currentLocale, requireParentPage } from '@/lib/server/guards';

export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  await requireParentPage();
  const t = getDictionary(await currentLocale());
  return (
    <ParentShell t={t} active="settings">
      <h1 className="h1">{t.settings.title}</h1>
      <div className="mt-6 grid gap-6">
        <section className="card space-y-3" aria-labelledby="lang-h">
          <h2 id="lang-h" className="h2">{t.settings.parentLanguage}</h2>
          <LanguageSwitch />
        </section>
        <section className="card space-y-3" aria-labelledby="pin-h">
          <h2 id="pin-h" className="h2">{t.settings.changePin}</h2>
          <p className="muted">{t.pin.body}</p>
          <PinForm />
        </section>
        <section className="card space-y-2" aria-labelledby="ai-h">
          <h2 id="ai-h" className="h2">{t.settings.ai}</h2>
          <p>{t.settings.aiOff}</p>
          <p className="text-sm muted">{t.privacy.aiBody}</p>
        </section>
      </div>
    </ParentShell>
  );
}
