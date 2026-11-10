import { summariseCspReport } from '@/lib/csp';

/** Receives CSP violation reports from the browser. Logs a minimal summary only; nothing is stored or forwarded. */
export async function POST(req: Request) {
  const text = (await req.text()).slice(0, 8192);
  let body: unknown = null;
  try { body = JSON.parse(text); } catch { /* ignore malformed reports */ }
  const s = summariseCspReport(body);
  if (s) console.warn(JSON.stringify({ event: 'csp_violation_report_only', ...s }));
  return new Response(null, { status: 204 });
}
