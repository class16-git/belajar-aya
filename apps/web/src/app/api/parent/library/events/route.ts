import { z } from 'zod';
import { prisma } from '@atlas/database';
import { isValidIsoDate } from '@atlas/shared';
import { audit } from '@/lib/server/audit';
import { ownedChild, parentRoute } from '@/lib/server/guards';
import { HttpError, json, parseBody } from '@/lib/server/http';
import { visibleBook } from '@/lib/server/library';

const level = z.number().int().min(0).max(3).nullable().default(null);
const createSchema = z.object({
  childId: z.string().min(1).max(40),
  bookId: z.string().regex(/^book-[a-z0-9-]+$/).max(120).nullable().default(null),
  kind: z.enum(['SHARED_READ', 'INDEPENDENT_READ', 'RETELL', 'ACTIVITY']),
  observedOn: z.string().refine(isValidIsoDate),
  parentAssisted: z.boolean().default(true),
  listening: level,
  decoding: level,
  enjoyment: z.number().int().min(0).max(2).nullable().default(null),
}).strict();

/**
 * Parent records a reading observation with a structured rubric. No free text (avoids child PII by default).
 * Listening and decoding are separate; nothing here changes maths mastery.
 */
export const POST = parentRoute('library.event_create', async (req, auth) => {
  const body = await parseBody(req, createSchema);
  const child = await ownedChild(auth, body.childId);
  if (body.bookId) visibleBook(body.bookId);
  const tomorrowUtc = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  if (body.observedOn > tomorrowUtc) throw new HttpError(400, 'VALIDATION_ERROR');
  const ev = await prisma.readingEvent.create({
    data: {
      childId: child.id,
      bookId: body.bookId,
      kind: body.kind,
      observedAt: new Date(`${body.observedOn}T12:00:00Z`),
      parentAssisted: body.parentAssisted,
      listening: body.listening,
      decoding: body.decoding,
      enjoyment: body.enjoyment,
    },
  });
  return json({ id: ev.id }, 201);
});

const deleteSchema = z.object({ childId: z.string().min(1).max(40), eventId: z.string().max(40).nullable().default(null) }).strict();

/** Delete one reading event, or a child's whole reading history (eventId null). */
export const DELETE = parentRoute('library.event_delete', async (req, auth) => {
  const body = await parseBody(req, deleteSchema);
  const child = await ownedChild(auth, body.childId);
  const { count } = await prisma.readingEvent.deleteMany({ where: { childId: child.id, ...(body.eventId ? { id: body.eventId } : {}) } });
  if (body.eventId && count === 0) throw new HttpError(404, 'NOT_FOUND');
  await audit(auth.family.id, auth.user.id, body.eventId ? 'library.event_deleted' : 'library.history_deleted', 'child', child.id);
  return json({ deleted: count });
}, { requireConsent: false });
