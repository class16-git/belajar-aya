import type { Locale } from '@atlas/shared';
import type { Unit } from '@atlas/curriculum';
import { fmt, type Dictionary } from '@/lib/i18n';
import type { ExpansionEntry } from '@/lib/server/expansion';
import { Section } from './badges';

export function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-paper p-2">
      <dt className="text-xs font-semibold uppercase tracking-wide muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

export function ArabicPhrases({ phrases, t, locale }: { phrases: Unit['arabicPhrases']; t: Dictionary; locale: Locale }) {
  const G = t.units.guide;
  return (
    <Section id="arabic" title={G.arabic} className="card print-card">
      <ul className="space-y-2">
        {phrases.map((p, i) => (
          <li key={i} className="rounded-xl border border-sand bg-paper p-3">
            <p lang="ar" dir="rtl" className="text-3xl leading-relaxed">{p.arabic}</p>
            <p className="mt-1"><span className="italic">{p.transliteration}</span> — {p.meaning[locale]}</p>
            <span className={`chip mt-2 ${p.verified ? 'border-sage-dark bg-sage-light text-sage-dark' : 'border-clay bg-clay-light text-clay-dark'}`}>{p.verified ? `✓ ${G.arabicVerified}` : `! ${G.arabicUnverified}`}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function Provenance({ e, t }: { e: ExpansionEntry; t: Dictionary }) {
  const G = t.units.guide;
  const x = e.item;
  const r = x.review;
  return (
    <Section id="provenance" title={G.provenance} className="card print-card text-sm">
      <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[12rem_1fr]">
        <dt className="font-semibold">{G.version}</dt><dd className="break-all">{x.id} · v{x.version}</dd>
        <dt className="font-semibold">{G.reviewStatus}</dt><dd>{t.curriculum.status[x.reviewStatus]}</dd>
        <dt className="font-semibold">{G.provenance}</dt><dd>{G.origin[x.provenance.origin]} · {G.batch}: {x.provenance.batch} · {G.created}: {x.provenance.createdAt}</dd>
        <dt className="font-semibold">{G.agentChecks}</dt><dd>{r.agentChecks.length ? r.agentChecks.join(' · ') : '—'}</dd>
        <dt className="font-semibold">{G.flags}</dt><dd>{x.reviewFlags.length ? x.reviewFlags.join(' · ') : '—'}</dd>
        <dt className="font-semibold">{t.review.form.legend}</dt>
        <dd>
          {r.rejectedReason ? fmt(G.rejectedReason, { reason: r.rejectedReason }) : r.reviewedBy && r.reviewedAt ? fmt(G.reviewedBy, { who: r.reviewedBy, role: r.reviewerRole ?? '—', date: r.reviewedAt }) : G.notReviewed}
        </dd>
      </dl>
    </Section>
  );
}
