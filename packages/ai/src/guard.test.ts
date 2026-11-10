import { describe, expect, it } from 'vitest';
import { assertNoPii, DisabledProvider, getProvider, guardedComplete, type AiProvider } from './index';

const opts = { enabled: true, timeoutMs: 50, validate: (t: string) => t.length < 200 };

describe('guarded AI adapter (scenario 8: AI unavailable)', () => {
  it('is disabled by default and resolves to a fallback, never throwing', async () => {
    expect(getProvider(undefined).name).toBe('none');
    const r = await guardedComplete(new DisabledProvider(), { purpose: 'rephrase_parent_explanation', input: {} }, opts);
    expect(r).toEqual({ ok: false, reason: 'disabled' });
  });
  it('outages and timeouts degrade to the deterministic fallback', async () => {
    const down: AiProvider = { name: 'x', complete: async () => Promise.reject(new Error('503')) };
    const slow: AiProvider = {
      name: 'y',
      complete: (_r, signal) => new Promise((_res, rej) => signal.addEventListener('abort', () => rej(new Error('abort')))),
    };
    expect(await guardedComplete(down, { purpose: 'rephrase_parent_explanation', input: {} }, opts)).toEqual({ ok: false, reason: 'unavailable' });
    expect(await guardedComplete(slow, { purpose: 'rephrase_parent_explanation', input: {} }, opts)).toEqual({ ok: false, reason: 'unavailable' });
  });
  it('rejects invalid output', async () => {
    const verbose: AiProvider = { name: 'v', complete: async () => 'x'.repeat(500) };
    expect(await guardedComplete(verbose, { purpose: 'rephrase_parent_explanation', input: {} }, opts)).toEqual({ ok: false, reason: 'invalid_output' });
  });
  it('blocks names, birthdates, emails and notes from ever reaching a provider', async () => {
    expect(() => assertNoPii({ purpose: 'rephrase_parent_explanation', input: { nickname: 'X' } })).toThrow();
    expect(() => assertNoPii({ purpose: 'rephrase_parent_explanation', input: { dateOfBirth: 'x' } })).toThrow();
    expect(() => assertNoPii({ purpose: 'rephrase_parent_explanation', input: { text: 'born 2019-01-01' } })).toThrow();
    expect(() => assertNoPii({ purpose: 'rephrase_parent_explanation', input: { text: 'a@b.co' } })).toThrow();
    expect(() => assertNoPii({ purpose: 'rephrase_parent_explanation', input: { observationNote: 'x' } })).toThrow();
    let called = false;
    const spy: AiProvider = { name: 's', complete: async () => ((called = true), 'ok') };
    const r = await guardedComplete(spy, { purpose: 'rephrase_parent_explanation', input: { childName: 'X' } }, opts);
    expect(r).toEqual({ ok: false, reason: 'blocked_pii' });
    expect(called).toBe(false);
    expect(() => assertNoPii({ purpose: 'rephrase_parent_explanation', input: { skillId: 'MATH-G1-BONDS-10', score: 0.5 } })).not.toThrow();
  });
});
