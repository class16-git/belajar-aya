import { notFound } from 'next/navigation';
import { getCatalog } from '@atlas/curriculum';
import { prisma } from '@atlas/database';
import { isLocale, localDateInTimeZone } from '@atlas/shared';
import { ChildForm } from '@/components/forms/child-form';
import { ParentShell } from '@/components/ui/parent-shell';
import { getDictionary } from '@/lib/i18n';
import { GRADES, isoFromDbDate, TIMEZONES } from '@/lib/server/children';
import { currentLocale, requireParentPage } from '@/lib/server/guards';

export const metadata = { title: 'Edit learner' };

export default async function EditChildPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireParentPage();
  const { id } = await params;
  const child = await prisma.childProfile.findFirst({ where: { id, familyId: auth.family.id } });
  if (!child) notFound();
  const locale = await currentLocale();
  const t = getDictionary(locale);
  const skills = getCatalog().skills.filter((s) => s.band === 'g1').map((s) => ({ id: s.id, title: s.title[locale] }));
  return (
    <ParentShell t={t} active="family">
      <h1 className="h1 mb-6">{t.child.editTitle}</h1>
      <ChildForm
        grades={GRADES}
        timezones={TIMEZONES.includes(child.timezone as (typeof TIMEZONES)[number]) ? TIMEZONES : [child.timezone, ...TIMEZONES]}
        skills={skills}
        today={localDateInTimeZone(new Date(), 'Pacific/Kiritimati')}
        initial={{
          id: child.id,
          nickname: child.nickname,
          dateOfBirth: isoFromDbDate(child.dateOfBirth),
          timezone: child.timezone,
          schoolGrade: child.schoolGrade,
          mode: child.mode,
          locale: isLocale(child.locale) ? child.locale : 'en',
          itemsPerSession: child.itemsPerSession,
          targetMinutes: child.targetMinutes,
          audioEnabled: child.audioEnabled,
          reducedMotion: child.reducedMotion,
          focusSkillId: child.focusSkillId,
        }}
      />
    </ParentShell>
  );
}
