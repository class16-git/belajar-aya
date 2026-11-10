import { childRoute } from '@/lib/server/guards';
import { json } from '@/lib/server/http';
import { requestHint } from '@/lib/server/learning';

export const POST = childRoute('activities.hint', async (_req, _auth, child, ctx) => {
  const { id } = await ctx.params;
  return json(await requestHint(child, id!));
});
