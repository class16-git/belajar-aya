'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n/client';

export function ObservationForm({
  childId,
  lessonId,
  skills,
  today,
}: {
  childId: string;
  lessonId?: string;
  skills?: { id: string; title: string }[];
  today: string;
}) {
  const { t } = useI18n();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const levels = ['NOT_TODAY', 'INTRODUCED', 'EXPLORING', 'INDEPENDENT'] as const;
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const r = await api('/api/parent/observations', {
          body: {
            childId,
            lessonId: lessonId ?? null,
            skillId: (f.get('skillId') as string) || null,
            level: f.get('level'),
            note: f.get('note') ?? '',
            observedOn: f.get('observedOn'),
          },
        });
        if (r.ok) {
          setMsg({ ok: true, text: t.observation.saved });
          (e.target as HTMLFormElement).reset();
          setTimeout(() => window.location.reload(), 400);
        } else setMsg({ ok: false, text: t.app.error });
      }}
    >
      {skills && !lessonId && (
        <div>
          <label htmlFor="obs-skill" className="field-label">{t.observation.skill}</label>
          <select id="obs-skill" name="skillId" className="input" required>
            {skills.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>
      )}
      <fieldset>
        <legend className="field-label">{t.observation.level}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {levels.map((l, i) => (
            <label key={l} className="flex min-h-11 items-center gap-3 rounded-xl border-2 border-sand bg-white px-3 py-2 has-[:checked]:border-sage-dark has-[:checked]:bg-sage-light">
              <input type="radio" name="level" value={l} defaultChecked={i === 1} className="h-5 w-5 accent-[#46613F]" />
              {t.observation.levels[l]}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <div>
          <label htmlFor="obs-note" className="field-label">{t.observation.note}</label>
          <textarea id="obs-note" name="note" rows={2} maxLength={1000} className="input" aria-describedby="obs-note-hint" />
          <p id="obs-note-hint" className="field-hint">{t.observation.noteHint}</p>
        </div>
        <div>
          <label htmlFor="obs-date" className="field-label">{t.observation.date}</label>
          <input id="obs-date" name="observedOn" type="date" defaultValue={today} max={today} className="input" required />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary">{t.observation.save}</button>
        <span role="status" className={msg?.ok ? 'font-semibold text-sage-dark' : 'font-semibold text-clay-dark'}>{msg?.text}</span>
      </div>
    </form>
  );
}
