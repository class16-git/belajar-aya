import { prisma } from '@atlas/database';
import { audit } from '@/lib/server/audit';
import { childInputSchema, isoFromDbDate, toChildData } from '@/lib/server/children';
import { parentRoute } from '@/lib/server/guards';
import { HttpError, json, parseBody } from '@/lib/server/http';

export const GET = parentRoute('children.list', async (_req, auth) => {
  const children = await prisma.childProfile.findMany({ where: { familyId: auth.family.id }, orderBy: { createdAt: 'asc' } });
  return json({ children: children.map((c) => ({ ...c, dateOfBirth: isoFromDbDate(c.dateOfBirth) })) });
});

export const POST = parentRoute('children.create', async (req, auth) => {
  const body = await parseBody(req, childInputSchema);
  const count = await prisma.childProfile.count({ where: { familyId: auth.family.id } });
  if (count >= 8) throw new HttpError(400, 'TOO_MANY_CHILDREN');
  const child = await prisma.childProfile.create({ data: { familyId: auth.family.id, ...toChildData(body) } });
  await audit(auth.family.id, auth.user.id, 'child.created', 'child', child.id, { mode: child.mode, hasDob: !!child.dateOfBirth });
  return json({ id: child.id }, 201);
});
