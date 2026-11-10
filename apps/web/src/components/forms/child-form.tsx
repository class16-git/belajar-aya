'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n/client';

export interface ChildFormValues {
  id?: string;
  nickname: string;
  dateOfBirth: string | null;
  timezone: string;
  schoolGrade: string | null;
  mode: 'TODDLER_OFFLINE' | 'ELEMENTARY_GUIDED';
  locale: 'en' | 'id';
  itemsPerSession: number;
  targetMinutes: number;
  audioEnabled: boolean;
  reducedMotion: boolean;
  focusSkillId: string | null;
}

export function ChildForm({
  initial,
  grades,
  timezones,
  skills,
  today,
}: {
  initial: ChildFormValues;
  grades: readonly string[];
  timezones: readonly string[];
  skills: { id: string; title: string }[];
  today: string;
}) {
  const { t } = useI18n();
  const [v, setV] = useState(initial);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const editing = !!initial.id;
  const sensitiveChanged = editing && (v.dateOfBirth !== initial.dateOfBirth || v.timezone !== initial.timezone);
  const set = <K extends keyof ChildFormValues>(k: K, val: ChildFormValues[K]) => setV((p) => ({ ...p, [k]: val }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (sensitiveChanged && !confirm) return setError(t.child.confirmSensitiveNeeded);
    if (v.dateOfBirth && v.dateOfBirth > today) return setError(t.child.invalidDob);
    setBusy(true);
    const { id, ...body } = v;
    const r = await api(editing ? `/api/parent/children/${id}` : '/api/parent/children', {
      method: editing ? 'PATCH' : 'POST',
      body: { ...body, ...(sensitiveChanged ? { confirmSensitive: true } : {}) },
    });
    setBusy(false);
    if (r.ok) window.location.href = '/family';
    else setError(r.data.error === 'CONFIRM_SENSITIVE' ? t.child.confirmSensitiveNeeded : r.data.error === 'VALIDATION_ERROR' ? t.child.invalidDob : t.app.error);
  }

  return (
    <form onSubmit={submit} className="card max-w-2xl space-y-5" noValidate>
      <div>
        <label htmlFor="nickname" className="field-label">{t.child.nickname}</label>
        <input id="nickname" className="input" required maxLength={40} value={v.nickname} onChange={(e) => set('nickname', e.target.value)} aria-describedby="nickname-hint" />
        <p id="nickname-hint" className="field-hint">{t.child.nicknameHint}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="dob" className="field-label">{t.child.dob}</label>
          <input id="dob" type="date" className="input" max={today} value={v.dateOfBirth ?? ''} onChange={(e) => set('dateOfBirth', e.target.value || null)} aria-describedby="dob-hint" />
          <p id="dob-hint" className="field-hint">{t.child.dobHint}</p>
        </div>
        <div>
          <label htmlFor="tz" className="field-label">{t.child.timezone}</label>
          <select id="tz" className="input" value={v.timezone} onChange={(e) => set('timezone', e.target.value)}>
            {timezones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
      </div>
      <fieldset>
        <legend className="field-label">{t.child.mode}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(['TODDLER_OFFLINE', 'ELEMENTARY_GUIDED'] as const).map((m) => (
            <label key={m} className={`flex cursor-pointer gap-3 rounded-xl border-2 p-3 ${v.mode === m ? 'border-sage-dark bg-sage-light' : 'border-sand bg-white'}`}>
              <input type="radio" name="mode" value={m} checked={v.mode === m} onChange={() => set('mode', m)} className="mt-1 h-5 w-5 accent-[#46613F]" />
              <span>
                <span className="block font-semibold">{m === 'TODDLER_OFFLINE' ? t.family.modeToddler : t.family.modeElementary}</span>
                <span className="text-sm muted">{m === 'TODDLER_OFFLINE' ? t.child.modeToddlerHelp : t.child.modeElementaryHelp}</span>
              </span>
            </label>
          ))}
        </div>
        <p className="field-hint">{t.child.under3Note}</p>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="grade" className="field-label">{t.child.grade}</label>
          <select id="grade" className="input" value={v.schoolGrade ?? ''} onChange={(e) => set('schoolGrade', e.target.value || null)} aria-describedby="grade-hint">
            <option value="">{t.child.gradeNone}</option>
            {grades.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <p id="grade-hint" className="field-hint">{t.child.gradeHint}</p>
        </div>
        <div>
          <label htmlFor="locale" className="field-label">{t.child.locale}</label>
          <select id="locale" className="input" value={v.locale} onChange={(e) => set('locale', e.target.value as 'en' | 'id')}>
            <option value="en">{t.app.english}</option>
            <option value="id">{t.app.indonesian}</option>
          </select>
        </div>
      </div>
      {v.mode === 'ELEMENTARY_GUIDED' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="items" className="field-label">{t.child.itemsPerSession}</label>
            <input id="items" type="number" min={3} max={10} className="input" value={v.itemsPerSession} onChange={(e) => set('itemsPerSession', Number(e.target.value))} />
          </div>
          <div>
            <label htmlFor="minutes" className="field-label">{t.child.targetMinutes}</label>
            <input id="minutes" type="number" min={5} max={30} className="input" value={v.targetMinutes} onChange={(e) => set('targetMinutes', Number(e.target.value))} />
          </div>
          <div>
            <label htmlFor="focus" className="field-label">{t.child.focus}</label>
            <select id="focus" className="input" value={v.focusSkillId ?? ''} onChange={(e) => set('focusSkillId', e.target.value || null)}>
              <option value="">{t.child.focusNone}</option>
              {skills.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-6">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" className="h-5 w-5 accent-[#46613F]" checked={v.reducedMotion} onChange={(e) => set('reducedMotion', e.target.checked)} />
          {t.child.reducedMotion}
        </label>
        <label className="inline-flex items-center gap-2 muted">
          <input type="checkbox" className="h-5 w-5" disabled checked={false} readOnly />
          {t.child.audio}
        </label>
      </div>
      {sensitiveChanged && (
        <label className="flex items-start gap-3 rounded-xl border-2 border-clay bg-clay-light/50 p-3">
          <input type="checkbox" className="mt-1 h-5 w-5 accent-[#8F4A28]" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
          <span>{t.child.confirmSensitive}</span>
        </label>
      )}
      <div role="alert" className="min-h-6 font-semibold text-clay-dark">{error}</div>
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={busy || !v.nickname.trim()}>{editing ? t.app.save : t.child.create}</button>
        <a href="/family" className="btn-secondary">{t.app.cancel}</a>
      </div>
    </form>
  );
}
