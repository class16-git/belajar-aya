import { prisma } from '@atlas/database';
import { audit } from '@/lib/server/audit';
import { childInputSchema, isoFromDbDate, toChildData } from '@/lib/server/children';
import { ownedChild, parentRoute } from '@/lib/server/guards';
import { HttpError, json, parseBody } from '@/lib/server/http';

export const PATCH = parentRoute('children.update', async (req, auth, ctx) => {
  const { id } = await ctx.params;
  const child = await ownedChild(auth, id!);
  const body = await parseBody(req, childInputSchema);
  const changed: string[] = [];
  if ((body.dateOfBirth ?? null) !== isoFromDbDate(child.dateOfBirth)) changed.push('dateOfBirth');
  if (body.timezone !== child.timezone) changed.push('timezone');
  // DOB / timezone changes recalculate age and placement: require explicit confirmation + audit.
  if (changed.length && body.confirmSensitive !== true) throw new HttpError(400, 'CONFIRM_SENSITIVE');
  const data = toChildData(body);
  await prisma.childProfile.update({
    where: { id: child.id },
    data: { ...data, ...(data.mode !== child.mode ? { transitionAcknowledged: false } : {}) },
  });
  if (changed.length) await audit(auth.family.id, auth.user.id, 'child.sensitive_updated', 'child', child.id, { fields: changed });
  if (data.mode !== child.mode) await audit(auth.family.id, auth.user.id, 'child.mode_changed', 'child', child.id, { from: child.mode, to: data.mode });
  return json({ ok: true });
});
