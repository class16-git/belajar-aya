import { audit } from '@/lib/server/audit';
import { parentRoute } from '@/lib/server/guards';
import { buildExport } from '@/lib/server/privacy';

// Export stays available even if consent was withdrawn.
export const GET = parentRoute('privacy.export', async (_req, auth) => {
  await audit(auth.family.id, auth.user.id, 'privacy.exported', 'family', auth.family.id);
  const data = await buildExport(auth);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="atlas-export-${new Date().toISOString().slice(0, 10)}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}, { requireConsent: false });
