import 'server-only';

/** Structured logs. Only opaque IDs and codes — never names, DOBs, emails or free-text notes. */
export function logEvent(event: string, fields: Record<string, string | number | boolean | null> = {}) {
  console.info(JSON.stringify({ level: 'info', event, at: new Date().toISOString(), ...fields }));
}

export function logError(event: string, err: unknown, fields: Record<string, string | number | null> = {}) {
  // Production logs never include free-form exception messages (they can echo submitted values).
  const code = typeof (err as { code?: unknown })?.code === 'string' ? (err as { code: string }).code : null;
  const e =
    err instanceof Error
      ? process.env.NODE_ENV === 'production'
        ? { name: err.name, code }
        : { name: err.name, code, message: err.message.slice(0, 300) }
      : { name: 'unknown', code: null };
  console.error(JSON.stringify({ level: 'error', event, at: new Date().toISOString(), ...fields, error: e }));
}
