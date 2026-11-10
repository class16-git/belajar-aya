import { describe, expect, it } from 'vitest';
import { parseAllowlist, signupDecision } from './signup-policy';

describe('sign-up allowlist (private family deployment)', () => {
  it('parses a comma-separated list, case- and space-insensitively', () => {
    expect(parseAllowlist(' Parent.One@Example.test , second@example.test ,, ')).toEqual(['parent.one@example.test', 'second@example.test']);
    expect(parseAllowlist(undefined)).toEqual([]);
  });

  it('with an allowlist, only listed emails may sign up (any environment)', () => {
    const list = parseAllowlist('owner@example.test');
    expect(signupDecision('owner@example.test', list, 'production')).toBe('allowed');
    expect(signupDecision('OWNER@example.test'.toLowerCase(), list, 'production')).toBe('allowed');
    expect(signupDecision('stranger@example.test', list, 'production')).toBe('closed');
    expect(signupDecision('stranger@example.test', list, 'preview')).toBe('closed');
  });

  it('production with no allowlist fails closed: nobody can sign up', () => {
    expect(signupDecision('anyone@example.test', [], 'production')).toBe('closed');
  });

  it('preview and development without an allowlist stay open (synthetic demo data only)', () => {
    expect(signupDecision('anyone@example.test', [], 'preview')).toBe('allowed');
    expect(signupDecision('anyone@example.test', [], 'development')).toBe('allowed');
  });
});
