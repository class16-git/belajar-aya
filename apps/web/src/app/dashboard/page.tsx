import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@atlas/database';
import { ParentShell } from '@/components/ui/parent-shell';
import { getDictionary } from '@/lib/i18n';
import { currentLocale, requireParentPage } from '@/lib/server/guards';

export const metadata = { title: 'Progress' };

export default async function DashboardIndex() {
  const auth = await requireParentPage();
  const children = await prisma.childProfile.findMany({ where: { familyId: auth.family.id }, orderBy: { createdAt: 'asc' } });
  if (children.length === 1) redirect(`/dashboard/${children[0]!.id}`);
  const t = getDictionary(await currentLocale());
  return (
    <ParentShell t={t} active="dashboard">
      <h1 className="h1">{t.nav.dashboard}</h1>
      <p className="mt-2">{children.length ? t.dashboard.choose : t.family.empty}</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {children.map((c) => (
          <li key={c.id}><Link href={`/dashboard/${c.id}`} className="card block font-semibold hover:border-bark">{c.nickname}</Link></li>
        ))}
      </ul>
    </ParentShell>
  );
}
