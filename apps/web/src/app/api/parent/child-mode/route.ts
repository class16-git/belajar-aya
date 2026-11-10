import { z } from 'zod';
import { prisma } from '@atlas/database';
import { audit } from '@/lib/server/audit';
import { ageContext } from '@/lib/server/children';
import { ownedChild, parentRoute } from '@/lib/server/guards';
import { HttpError, json, parseBody } from '@/lib/server/http';

const schema = z.object({ childId: z.string().min(1).max(40) }).strict();

export const POST = parentRoute('child_mode.enter', async (req, auth) => {
  const { childId } = await parseBody(req, schema);
  const child = await ownedChild(auth, childId);
  if (!auth.user.pinHash) throw new HttpError(400, 'PIN_REQUIRED');
  if (!ageContext(child).policy.childScreenActivitiesAllowed) throw new HttpError(403, 'OFFLINE_ONLY');
  await prisma.session.update({ where: { id: auth.session.id }, data: { childModeChildId: child.id } });
  await audit(auth.family.id, auth.user.id, 'child_mode.entered', 'child', child.id);
  return json({ ok: true });
});
