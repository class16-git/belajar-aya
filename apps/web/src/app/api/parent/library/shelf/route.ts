import { z } from 'zod';
import { prisma } from '@atlas/database';
import { audit } from '@/lib/server/audit';
import { ownedChild, parentRoute } from '@/lib/server/guards';
import { json, parseBody } from '@/lib/server/http';
import { visibleBook } from '@/lib/server/library';

const schema = z.object({
  childId: z.string().min(1).max(40),
  bookId: z.string().regex(/^book-[a-z0-9-]+$/).max(120),
  /** null removes the entry (the book is neither on the shelf nor hidden). */
  state: z.enum(['ON_SHELF', 'HIDDEN']).nullable(),
}).strict();

/** Parent puts a book on (or hides it from) one child's shelf. Family-scoped; only visible books. */
export const POST = parentRoute('library.shelf', async (req, auth) => {
  const body = await parseBody(req, schema);
  const child = await ownedChild(auth, body.childId);
  if (body.state === null) {
    await prisma.shelfEntry.deleteMany({ where: { childId: child.id, bookId: body.bookId } });
  } else {
    visibleBook(body.bookId);
    await prisma.shelfEntry.upsert({
      where: { childId_bookId: { childId: child.id, bookId: body.bookId } },
      create: { childId: child.id, bookId: body.bookId, state: body.state },
      update: { state: body.state },
    });
  }
  await audit(auth.family.id, auth.user.id, 'library.shelf_changed', 'child', child.id);
  return json({ ok: true });
});
