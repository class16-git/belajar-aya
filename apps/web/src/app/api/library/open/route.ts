import { z } from 'zod';
import { prisma } from '@atlas/database';
import { verifySecret } from '@atlas/shared/server';
import { audit } from '@/lib/server/audit';
import { childRoute } from '@/lib/server/guards';
import { HttpError, json, parseBody } from '@/lib/server/http';
import { rateLimit } from '@/lib/server/rate-limit';
import { childShelf } from '@/lib/server/library';

const schema = z.object({ bookId: z.string().regex(/^book-[a-z0-9-]+$/).max(120), pin: z.string().regex(/^\d{4,8}$/) }).strict();

/**
 * Parent gate for leaving Atlas from child mode. The URL is taken from the reviewed catalog (never from the request),
 * so there is no open redirect; nothing about the child is added to it. The session stays in child mode.
 */
export const POST = childRoute('library.open_external', async (req, auth, child) => {
  await rateLimit(`pin:${auth.session.id}`, 5, 600);
  await rateLimit(`pin-user:${auth.user.id}`, 20, 86_400);
  const body = await parseBody(req, schema).catch(() => {
    throw new HttpError(401, 'WRONG_PIN');
  });
  if (!(await verifySecret(body.pin, auth.user.pinHash))) {
    await audit(auth.family.id, null, 'library.pin_failed', 'child', child.id);
    throw new HttpError(401, 'WRONG_PIN');
  }
  const family = await prisma.family.findUniqueOrThrow({ where: { id: auth.family.id }, select: { libraryExternalLinks: true } });
  if (!family.libraryExternalLinks) throw new HttpError(403, 'EXTERNAL_LINKS_OFF');
  const book = (await childShelf(child.id)).find((b) => b.id === body.bookId);
  if (!book || book.accessMode !== 'external_link') throw new HttpError(404, 'NOT_FOUND');
  await audit(auth.family.id, auth.user.id, 'library.external_opened', 'child', child.id);
  return json({ url: book.sourcePageUrl });
});
