import { prisma } from '@atlas/database';
import { audit } from '@/lib/server/audit';
import { ownedChild, parentRoute } from '@/lib/server/guards';
import { json } from '@/lib/server/http';

export const POST = parentRoute('children.ack_transition', async (_req, auth, ctx) => {
  const { id } = await ctx.params;
  const child = await ownedChild(auth, id!);
  await prisma.childProfile.update({ where: { id: child.id }, data: { transitionAcknowledged: true } });
  await audit(auth.family.id, auth.user.id, 'child.transition_acknowledged', 'child', child.id);
  return json({ ok: true });
});
