import { z } from 'zod';
import { getCatalog, getLesson } from '@atlas/curriculum';
import { prisma } from '@atlas/database';
import { isValidIsoDate } from '@atlas/shared';
import { ownedChild, parentRoute } from '@/lib/server/guards';
import { HttpError, json, parseBody } from '@/lib/server/http';

const schema = z.object({
  childId: z.string().min(1).max(40),
  lessonId: z.string().max(80).nullable().default(null),
  skillId: z.string().max(80).nullable().default(null),
  level: z.enum(['NOT_TODAY', 'INTRODUCED', 'EXPLORING', 'INDEPENDENT']),
  note: z.string().max(1000).default(''),
  observedOn: z.string().refine(isValidIsoDate),
}).strict();

export const POST = parentRoute('observations.create', async (req, auth) => {
  const body = await parseBody(req, schema);
  const child = await ownedChild(auth, body.childId);
  const lesson = body.lessonId ? getLesson(body.lessonId) : undefined;
  if (body.lessonId && !lesson) throw new HttpError(400, 'UNKNOWN_LESSON');
  const skillId = lesson?.skillId ?? body.skillId;
  if (skillId && !getCatalog().skills.some((s) => s.id === skillId)) throw new HttpError(400, 'UNKNOWN_SKILL');
  const tomorrowUtc = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10); // allows any timezone's "today"
  if (body.observedOn > tomorrowUtc) throw new HttpError(400, 'VALIDATION_ERROR');
  // Stored as plain text and always rendered as text (never HTML); never sent to analytics or AI.
  const obs = await prisma.parentObservation.create({
    data: {
      childId: child.id,
      lessonId: lesson?.id ?? null,
      skillId: skillId ?? null,
      level: body.level,
      note: body.note.trim(),
      observedAt: new Date(`${body.observedOn}T12:00:00Z`),
    },
  });
  return json({ id: obs.id }, 201);
});
