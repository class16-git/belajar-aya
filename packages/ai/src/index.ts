/**
 * Optional runtime AI — guarded adapter (Phase 1: disabled; no provider is wired).
 * Core lessons, grading and adaptation never depend on this module.
 * Children never talk to a model; only parent-facing, reviewed, schema-validated uses are allowed later.
 */
export type AiPurpose = 'rephrase_parent_explanation' | 'draft_lesson_variant_for_review';

export interface AiRequest {
  purpose: AiPurpose;
  /** Minimal pseudonymous state only. */
  input: Record<string, string | number | boolean>;
}
export type AiResult = { ok: true; text: string } | { ok: false; reason: 'disabled' | 'unavailable' | 'invalid_output' | 'blocked_pii' };

export interface AiProvider {
  readonly name: string;
  complete(req: AiRequest, signal: AbortSignal): Promise<string>;
}

export class DisabledProvider implements AiProvider {
  readonly name = 'none';
  async complete(): Promise<string> {
    throw new Error('AI disabled');
  }
}

const PII_KEYS = /name|nickname|dob|birth|email|photo|address|school|note/i;
const DATE_RE = /\b\d{4}-\d{2}-\d{2}\b/;
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;

/** Throws if a request would carry identifiers. Defense in depth; callers must already minimise. */
export function assertNoPii(req: AiRequest): void {
  for (const [k, v] of Object.entries(req.input)) {
    if (PII_KEYS.test(k)) throw new Error(`PII field not allowed in AI request: ${k}`);
    if (typeof v === 'string' && (DATE_RE.test(v) || EMAIL_RE.test(v))) {
      throw new Error(`PII-like value not allowed in AI request field: ${k}`);
    }
  }
}

export interface GuardedOptions {
  enabled: boolean;
  timeoutMs: number;
  validate: (text: string) => boolean;
}

/** Always resolves; never throws. Returns a failure reason so callers use the deterministic fallback. */
export async function guardedComplete(provider: AiProvider, req: AiRequest, opts: GuardedOptions): Promise<AiResult> {
  if (!opts.enabled || provider.name === 'none') return { ok: false, reason: 'disabled' };
  try {
    assertNoPii(req);
  } catch {
    return { ok: false, reason: 'blocked_pii' };
  }
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), opts.timeoutMs);
  try {
    const text = await provider.complete(req, ctl.signal);
    return opts.validate(text) ? { ok: true, text } : { ok: false, reason: 'invalid_output' };
  } catch {
    return { ok: false, reason: 'unavailable' };
  } finally {
    clearTimeout(timer);
  }
}

export function getProvider(env: string | undefined): AiProvider {
  // Only "none" exists in Phase 1. Adding a provider requires an ADR, privacy review and owner approval.
  void env;
  return new DisabledProvider();
}
