import { childRoute } from '@/lib/server/guards';
import { json } from '@/lib/server/http';
import { finishSession } from '@/lib/server/learning';

export const POST = childRoute('learn.session.finish', async (_req, _auth, child, ctx) => {
  const { id } = await ctx.params;
  return json(await finishSession(child, id!));
});
