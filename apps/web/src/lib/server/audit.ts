import 'server-only';
import { prisma, type Prisma } from '@atlas/database';

/** Audit sensitive actions. Metadata: codes and field names only — never values like DOB or notes. */
export async function audit(
  familyId: string | null,
  actorId: string | null,
  action: string,
  targetType: string,
  targetId?: string | null,
  metadata: Prisma.InputJsonObject = {},
) {
  await prisma.auditEvent.create({ data: { familyId, actorId, action, targetType, targetId: targetId ?? null, metadata } });
}
