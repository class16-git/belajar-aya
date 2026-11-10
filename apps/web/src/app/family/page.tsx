import Link from 'next/link';
import { prisma } from '@atlas/database';
import { PinForm } from '@/components/forms/pin-form';
import { StartLearningButton } from '@/components/forms/start-learning';
import { ParentShell } from '@/components/ui/parent-shell';
import { fmt, getDictionary } from '@/lib/i18n';
import { ageContext } from '@/lib/server/children';
import { currentLocale, requireParentPage } from '@/lib/server/guards';

export const metadata = { title: 'Family' };

export default async function FamilyPage() {
  const auth = await requireParentPage();
  const t = getDictionary(await currentLocale());
  const children = await prisma.childProfile.findMany({ where: { familyId: auth.family.id }, orderBy: { createdAt: 'asc' } });
  const hasPin = !!auth.user.pinHash;
  return (
    <ParentShell t={t} active="family">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="h1">{t.family.title}</h1>
        <Link href="/children/new" className="btn-primary">+ {t.family.addChild}</Link>
      </div>
      {!hasPin && (
        <section aria-labelledby="pin-h" className="card mt-6 border-clay bg-clay-light/40">
          <h2 id="pin-h" className="h2">{t.pin.setTitle}</h2>
          <p className="mb-4 mt-1">{t.family.pinNeeded}</p>
          <PinForm />
        </section>
      )}
      {children.length === 0 ? (
        <p className="card mt-6">{t.family.empty}</p>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {children.map((c) => {
            const ctx = ageContext(c);
            const screen = ctx.policy.childScreenActivitiesAllowed;
            return (
              <li key={c.id} className="card flex flex-col gap-4" data-testid={`child-${c.nickname}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="h2">{c.nickname}</h2>
                    <p className="muted">
                      {ctx.age ? fmt(t.dashboard.years, { y: ctx.age.years, m: ctx.age.months }) : t.family.ageUnknown}
                      {c.schoolGrade ? ` · ${c.schoolGrade}` : ''}
                    </p>
                  </div>
                  <span className={`chip ${screen ? 'border-sky bg-sky-light text-[#2f5370]' : 'border-sage bg-sage-light text-sage-dark'}`}>
                    {screen ? t.family.modeElementary : t.family.modeToddler}
                  </span>
                </div>
                {ctx.notices.length > 0 && (
                  <p className="rounded-xl bg-linen p-3 text-sm">{fmt(t.dashboard.transitionTitle, { name: c.nickname })}</p>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-2">
                  {screen ? (
                    <StartLearningButton childId={c.id} disabled={!hasPin} />
                  ) : (
                    <Link href={`/cards?child=${c.id}`} className="btn-primary">{t.family.openCards}</Link>
                  )}
                  <Link href={`/dashboard/${c.id}`} className="btn-secondary">{t.family.viewProgress}</Link>
                  <Link href={`/children/${c.id}`} aria-label={`${t.family.edit} ${c.nickname}`} className="btn-ghost">{t.family.edit}</Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {children.some((c) => ageContext(c).policy.childScreenActivitiesAllowed) && hasPin && (
        <p className="mt-6 muted">{t.family.childModeIntro}</p>
      )}
    </ParentShell>
  );
}
