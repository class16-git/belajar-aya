import { getCatalog } from '@atlas/curriculum';
import { localDateInTimeZone } from '@atlas/shared';
import { ChildForm } from '@/components/forms/child-form';
import { ParentShell } from '@/components/ui/parent-shell';
import { getDictionary } from '@/lib/i18n';
import { GRADES, TIMEZONES } from '@/lib/server/children';
import { currentLocale, requireParentPage } from '@/lib/server/guards';

export const metadata = { title: 'Add a child' };

export default async function NewChildPage() {
  await requireParentPage();
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const skills = getCatalog().skills.filter((s) => s.band === 'g1').map((s) => ({ id: s.id, title: s.title[locale] }));
  return (
    <ParentShell t={t} active="family">
      <h1 className="h1 mb-6">{t.child.newTitle}</h1>
      <ChildForm
        grades={GRADES}
        timezones={TIMEZONES}
        skills={skills}
        today={localDateInTimeZone(new Date(), 'Pacific/Kiritimati')}
        initial={{ nickname: '', dateOfBirth: null, timezone: 'Asia/Jakarta', schoolGrade: null, mode: 'ELEMENTARY_GUIDED', locale, itemsPerSession: 5, targetMinutes: 15, audioEnabled: false, reducedMotion: false, focusSkillId: null }}
      />
    </ParentShell>
  );
}
