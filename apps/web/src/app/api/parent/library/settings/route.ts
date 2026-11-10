import { z } from 'zod';
import { prisma } from '@atlas/database';
import { audit } from '@/lib/server/audit';
import { parentRoute } from '@/lib/server/guards';
import { json, parseBody } from '@/lib/server/http';

const schema = z.object({ externalLinks: z.boolean() }).strict();

/** Family-wide switch for links to external book websites (child and parent views). */
export const POST = parentRoute('library.settings', async (req, auth) => {
  const body = await parseBody(req, schema);
  await prisma.family.update({ where: { id: auth.family.id }, data: { libraryExternalLinks: body.externalLinks } });
  await audit(auth.family.id, auth.user.id, body.externalLinks ? 'library.external_links_on' : 'library.external_links_off', 'family', auth.family.id);
  return json({ ok: true });
});
