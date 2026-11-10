import { notFound } from 'next/navigation';
import { prisma } from '@atlas/database';
import { ChildShell } from '@/components/child/child-shell';
import { ActivityRunner } from '@/components/learning/activity-runner';
import { requireChildPage } from '@/lib/server/guards';

export const metadata = { title: 'Learning session' };
export const dynamic = 'force-dynamic';

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { child } = await requireChildPage();
  const { id } = await params;
  const session = await prisma.learningSession.findFirst({ where: { id, childId: child.id }, select: { id: true } });
  if (!session) notFound();
  return (
    <ChildShell reducedMotion={child.reducedMotion}>
      <ActivityRunner sessionId={session.id} />
    </ChildShell>
  );
}
