import 'server-only';

/** Structured logs. Only opaque IDs and codes — never names, DOBs, emails or free-text notes. */
export function logEvent(event: string, fields: Record<string, string | number | boolean | null> = {}) {
  console.info(JSON.stringify({ level: 'info', event, at: new Date().toISOString(), ...fields }));
}

export function logError(event: string, err: unknown, fields: Record<string, string | number | null> = {}) {
  const e = err instanceof Error ? { name: err.name, message: err.message.slice(0, 300) } : { message: 'unknown' };
  console.error(JSON.stringify({ level: 'error', event, at: new Date().toISOString(), ...fields, error: e }));
}
