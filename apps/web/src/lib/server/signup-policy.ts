/**
 * Who may create a parent account.
 * - ATLAS_SIGNUP_ALLOWED_EMAILS (comma-separated) set → only those emails, in every environment.
 * - Not set → production is closed to everyone (fail closed; a private family app must not offer open sign-up);
 *   preview/development stay open because they only ever hold synthetic demo data.
 * The list is configuration (e.g. Vercel encrypted env), never committed to the repository.
 */
export type DeployEnv = 'production' | 'preview' | 'development';

export function parseAllowlist(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function signupDecision(email: string, allowlist: string[], env: DeployEnv): 'allowed' | 'closed' {
  if (allowlist.length > 0) return allowlist.includes(email.trim().toLowerCase()) ? 'allowed' : 'closed';
  return env === 'production' ? 'closed' : 'allowed';
}
