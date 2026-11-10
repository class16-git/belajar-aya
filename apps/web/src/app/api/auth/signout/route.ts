import { handle, json } from '@/lib/server/http';
import { getAuth, destroySession } from '@/lib/server/session';
import { HttpError } from '@/lib/server/http';

export const POST = handle('auth.signout', async () => {
  const auth = await getAuth();
  // A child in child mode must not be able to sign the parent out to bypass the PIN.
  if (auth?.session.childModeChildId) throw new HttpError(403, 'PARENT_GATE');
  await destroySession();
  return json({ ok: true });
});
