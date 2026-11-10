'use client';
import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n/client';

export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const { t, locale } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const signup = mode === 'signup';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const r = await api(signup ? '/api/auth/signup' : '/api/auth/signin', {
      body: { email: f.get('email'), password: f.get('password'), ...(signup ? { locale } : {}) },
    });
    setBusy(false);
    if (r.ok) {
      window.location.href = signup ? '/consent' : '/family';
      return;
    }
    setError(
      r.status === 429 ? t.auth.rateLimited
      : r.data.error === 'EMAIL_EXISTS' ? t.auth.exists
      : r.status === 401 ? t.auth.invalid
      : r.status === 0 ? t.app.offline
      : r.data.error === 'VALIDATION_ERROR' && signup ? t.auth.passwordHint
      : t.app.error,
    );
  }

  return (
    <form onSubmit={onSubmit} className="card mx-auto w-full max-w-md space-y-4" noValidate>
      <h1 className="h1">{signup ? t.auth.signUpTitle : t.auth.signInTitle}</h1>
      {signup && <p className="muted">{t.auth.adultsOnly}</p>}
      <div>
        <label htmlFor="email" className="field-label">{t.auth.email}</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">{t.auth.password}</label>
        <input id="password" name="password" type="password" required minLength={signup ? 12 : undefined}
          autoComplete={signup ? 'new-password' : 'current-password'} className="input" aria-describedby={signup ? 'pw-hint' : undefined} />
        {signup && <p id="pw-hint" className="field-hint">{t.auth.passwordHint}</p>}
      </div>
      <div role="alert" aria-live="assertive" className="min-h-6 font-semibold text-clay-dark">{error}</div>
      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? t.app.loading : signup ? t.auth.signUp : t.auth.signIn}
      </button>
      <p className="text-center">
        {signup ? t.auth.haveAccount : t.auth.noAccount}{' '}
        <Link href={signup ? '/signin' : '/signup'} className="link">{signup ? t.auth.signIn : t.auth.signUp}</Link>
      </p>
    </form>
  );
}
