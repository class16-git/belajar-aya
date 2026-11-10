'use client';
import { fmt } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n/client';
import { useRef, type KeyboardEvent } from 'react';

/** Scattered dots (pictorial counting). Tap a dot to mark it counted. */
export function ScatteredDots({
  dots,
  marked,
  onToggle,
  disabled,
}: {
  dots: { x: number; y: number }[];
  marked: Set<number>;
  onToggle: (i: number) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div role="group" aria-label={fmt(t.learn.a11y.dots, { n: dots.length })} className="relative mx-auto aspect-[4/5] w-full max-w-sm rounded-2xl border-4 border-bark bg-linen">
      {dots.map((d, i) => {
        const on = marked.has(i);
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            aria-pressed={on}
            aria-label={fmt(on ? t.learn.a11y.dotCounted : t.learn.a11y.dot, { n: i + 1 })}
            onClick={() => onToggle(i)}
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
            className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-focus"
          >
            <span className={`block h-9 w-9 rounded-full bg-bead-gold ${on ? 'ring-4 ring-sage-dark ring-offset-2 ring-offset-linen' : ''}`}>
              {on && (
                <svg viewBox="0 0 24 24" className="h-full w-full p-1.5" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Part–part–whole number bond diagram. `unknown` side shows "?" (dashed, not colour-only). */
export function NumberBond({
  whole,
  part,
  unknownSide,
  revealed,
}: {
  whole: number;
  part: number;
  unknownSide: 'left' | 'right';
  revealed?: number | null;
}) {
  const { t } = useI18n();
  const left = unknownSide === 'left' ? null : part;
  const right = unknownSide === 'right' ? null : part;
  const shown = (v: number | null) => (v === null ? (revealed ?? '?') : v);
  const label = fmt(t.learn.a11y.bond, {
    whole,
    left: left ?? revealed ?? t.learn.a11y.unknown,
    right: right ?? revealed ?? t.learn.a11y.unknown,
  });
  const circle = (cx: number, cy: number, r: number, v: number | null, dots: number) => (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={v === null ? '#8F4A28' : '#5B4636'} strokeWidth="5" strokeDasharray={v === null && revealed == null ? '10 7' : undefined} />
      <text x={cx} y={cy + 15} textAnchor="middle" fontSize="44" fontWeight="700" fill={v === null ? '#8F4A28' : '#2E2620'}>{shown(v)}</text>
      {v !== null && dots > 0 && dots <= 10 && (
        <g aria-hidden="true">
          {Array.from({ length: dots }, (_, i) => (
            <circle key={i} cx={cx - ((Math.min(dots, 5) - 1) * 9) + (i % 5) * 18} cy={cy + r + 16 + Math.floor(i / 5) * 16} r="6" fill="#B5443A" />
          ))}
        </g>
      )}
    </g>
  );
  return (
    <svg viewBox="0 0 320 260" role="img" aria-label={label} className="mx-auto h-auto w-full max-w-sm">
      <line x1="160" y1="80" x2="85" y2="155" stroke="#5B4636" strokeWidth="5" />
      <line x1="160" y1="80" x2="235" y2="155" stroke="#5B4636" strokeWidth="5" />
      {circle(160, 58, 46, whole, 0)}
      {circle(80, 170, 40, left, left ?? 0)}
      {circle(240, 170, 40, right, right ?? 0)}
    </svg>
  );
}

/** Large on-screen number pad for abstract items. */
export function Keypad({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const { t } = useI18n();
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  return (
    <div role="group" aria-label={t.learn.typeAnswer} className="grid max-w-xs grid-cols-3 gap-2">
      {keys.map((k) => (
        <button key={k} type="button" disabled={disabled} onClick={() => onChange((value + k).slice(-2))}
          className={`btn-secondary btn-xl min-h-16 text-2xl ${k === '0' ? 'col-start-2' : ''}`}>
          {k}
        </button>
      ))}
      <button type="button" disabled={disabled || !value} onClick={() => onChange('')} className="btn-ghost col-start-3 row-start-4 min-h-16">
        {t.learn.clear}
      </button>
    </div>
  );
}

export function Choices({
  options,
  selected,
  onSelect,
  disabled,
  eliminated,
}: {
  options: number[];
  selected: number | null;
  onSelect: (v: number) => void;
  disabled?: boolean;
  eliminated: Set<number>;
}) {
  const { t } = useI18n();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  // WAI-ARIA radio group (ATL-13): one tab stop (the checked option, else the first available one); arrow keys,
  // Home and End move to and check the next available option, skipping eliminated ones; Space/Enter check.
  const available = options.map((o) => !disabled && !eliminated.has(o));
  const selectedIdx = options.findIndex((o) => o === selected);
  const tabStop = selectedIdx >= 0 && available[selectedIdx] ? selectedIdx : available.indexOf(true);
  function move(from: number, step: 1 | -1, absolute?: 'first' | 'last') {
    const n = options.length;
    let i = absolute === 'first' ? -1 : absolute === 'last' ? n : from;
    const dir = absolute === 'last' ? -1 : absolute === 'first' ? 1 : step;
    for (let k = 0; k < n; k++) {
      i = (i + dir + n) % n;
      if (available[i]) {
        onSelect(options[i]!);
        refs.current[i]?.focus();
        return;
      }
    }
  }
  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const keys: Record<string, () => void> = {
      ArrowRight: () => move(i, 1),
      ArrowDown: () => move(i, 1),
      ArrowLeft: () => move(i, -1),
      ArrowUp: () => move(i, -1),
      Home: () => move(i, 1, 'first'),
      End: () => move(i, -1, 'last'),
    };
    const fn = keys[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  }
  return (
    <div role="radiogroup" aria-label={t.learn.chooseAnswer} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {options.map((o, i) => {
        const on = selected === o;
        const out = eliminated.has(o);
        return (
          <button
            key={o}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={i === tabStop ? 0 : -1}
            disabled={disabled || out}
            onClick={() => onSelect(o)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`flex min-h-16 items-center justify-center rounded-2xl border-4 text-3xl font-bold transition-colors duration-calm focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed ${
              on ? 'border-sky bg-sky-light text-ink' : out ? 'border-sand bg-linen text-muted line-through' : 'border-sand bg-white text-ink hover:border-bark'
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

/**
 * General part–part–whole bond: any one of the three values may be unknown (null → "?", dashed outline).
 * Used for addition (whole unknown) and subtraction (one part unknown).
 */
export function Bond({ whole, left, right, revealed }: { whole: number | null; left: number | null; right: number | null; revealed?: number | null }) {
  const { t } = useI18n();
  const show = (v: number | null) => v ?? revealed ?? t.learn.a11y.unknown;
  const label = fmt(t.learn.a11y.bond, { whole: show(whole), left: show(left), right: show(right) });
  const circle = (cx: number, cy: number, r: number, v: number | null, dots: number) => (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={v === null ? '#8F4A28' : '#5B4636'} strokeWidth="5" strokeDasharray={v === null && revealed == null ? '10 7' : undefined} />
      <text x={cx} y={cy + 15} textAnchor="middle" fontSize="44" fontWeight="700" fill={v === null ? '#8F4A28' : '#2E2620'}>{v ?? revealed ?? '?'}</text>
      {v !== null && dots > 0 && dots <= 10 && (
        <g aria-hidden="true">
          {Array.from({ length: dots }, (_, i) => (
            <circle key={i} cx={cx - ((Math.min(dots, 5) - 1) * 9) + (i % 5) * 18} cy={cy + r + 16 + Math.floor(i / 5) * 16} r="6" fill="#B5443A" />
          ))}
        </g>
      )}
    </g>
  );
  return (
    <svg viewBox="0 0 320 260" role="img" aria-label={label} className="mx-auto h-auto w-full max-w-sm" data-testid="bond">
      <line x1="160" y1="80" x2="85" y2="155" stroke="#5B4636" strokeWidth="5" />
      <line x1="160" y1="80" x2="235" y2="155" stroke="#5B4636" strokeWidth="5" />
      {circle(160, 58, 46, whole, 0)}
      {circle(80, 170, 40, left, left ?? 0)}
      {circle(240, 170, 40, right, right ?? 0)}
    </svg>
  );
}

export type SentenceToken = number | '+' | '−' | '=' | null;

/** Number sentence such as `3 + □ = 9`. `null` is the answer box (dashed border, not colour only). */
export function Sentence({ tokens, value }: { tokens: SentenceToken[]; value: string }) {
  const { t } = useI18n();
  const text = tokens.map((x) => (x === null ? (value || t.learn.a11y.blank) : String(x))).join(' ');
  return (
    <p role="img" aria-label={fmt(t.learn.a11y.sentence, { text })} className="flex flex-wrap items-center justify-center gap-3 py-6 text-5xl font-bold" data-testid="sentence">
      {tokens.map((x, i) =>
        x === null ? (
          <span key={i} aria-hidden="true" className="inline-flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-dashed border-clay-dark bg-white text-5xl font-bold text-ink">{value || ' '}</span>
        ) : (
          <span key={i} aria-hidden="true">{x}</span>
        ),
      )}
    </p>
  );
}

/**
 * Part–whole bar model (Singapore-style). The whole bar spans the top; the two part bars below are drawn to
 * scale. The unknown box is dashed and labelled "?" so it never relies on colour.
 */
export function BarModel({ whole, left, right, revealed }: { whole: number | null; left: number | null; right: number | null; revealed?: number | null }) {
  const { t } = useI18n();
  const total = whole ?? (left ?? 0) + (right ?? 0);
  const l = left ?? total - (right ?? 0);
  const W = 300;
  const x0 = 10;
  const lw = Math.max(40, Math.round((l / Math.max(total, 1)) * W));
  const show = (v: number | null) => v ?? revealed ?? '?';
  const box = (x: number, y: number, w: number, v: number | null, fill: string) => (
    <g>
      <rect x={x} y={y} width={w} height={52} rx={8} fill={v === null ? '#fff' : fill} stroke={v === null ? '#8F4A28' : '#5B4636'} strokeWidth={4} strokeDasharray={v === null && revealed == null ? '10 7' : undefined} />
      <text x={x + w / 2} y={y + 36} textAnchor="middle" fontSize="30" fontWeight="700" fill={v === null ? '#8F4A28' : '#2E2620'}>{show(v)}</text>
    </g>
  );
  const label = fmt(t.learn.a11y.bar, {
    whole: show(whole),
    left: show(left),
    right: show(right),
  });
  return (
    <svg viewBox="0 0 320 170" role="img" aria-label={label} className="mx-auto h-auto w-full max-w-md" data-testid="bar-model">
      {box(x0, 12, W, whole, '#F3E7D3')}
      <path d={`M${x0} 80 v-8 h${W} v8`} fill="none" stroke="#5B4636" strokeWidth="3" aria-hidden="true" />
      {box(x0, 96, lw, left, '#F6D7CF')}
      {box(x0 + lw, 96, W - lw, right, '#D7E6F3')}
    </svg>
  );
}

type RobotDir = 'up' | 'right' | 'down' | 'left';
type RobotCell = { x: number; y: number };
const ARROW: Record<RobotDir, string> = { up: '↑', right: '→', down: '↓', left: '←' };
const MOVE: Record<RobotDir, RobotCell> = { up: { x: 0, y: -1 }, right: { x: 1, y: 0 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 } };

/** The arrow program as a numbered list (screen readers hear "Step 2: left"). */
export function RobotProgram({ program, highlight }: { program: RobotDir[]; highlight?: number | null }) {
  const { t } = useI18n();
  return (
    <div>
      <p className="text-sm font-semibold text-muted">{t.learn.robot.program}</p>
      <ol className="mt-1 flex flex-wrap gap-2" data-testid="robot-program">
        {program.map((d, i) => (
          <li key={i} aria-label={`${fmt(t.learn.robot.step, { n: i + 1 })}: ${t.learn.robot.dir[d]}`}
            className={`flex min-w-14 flex-col items-center rounded-xl border-2 px-2 py-1 ${highlight === i + 1 ? 'border-clay-dark bg-clay-light' : 'border-sand bg-white'}`}>
            <span aria-hidden="true" className="text-xs font-semibold text-muted">{i + 1}</span>
            <span aria-hidden="true" className="text-3xl font-bold leading-none">{ARROW[d]}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Unplugged-style robot grid. Robot, stars and flag are distinct shapes with labels (never colour only).
 * `pathSteps` draws a dotted path for the first n steps of the program (hint representation).
 */
export function RobotGrid({ size, start, program, markers = [], target, pathSteps = 0 }: {
  size: number; start: RobotCell; program: RobotDir[]; markers?: (RobotCell & { label: number })[]; target?: RobotCell; pathSteps?: number;
}) {
  const { t } = useI18n();
  const C = 60;
  const W = size * C;
  const mid = (v: number) => v * C + C / 2;
  const path: RobotCell[] = [start];
  for (const d of program.slice(0, pathSteps)) {
    const last = path[path.length - 1]!;
    path.push({ x: last.x + MOVE[d].x, y: last.y + MOVE[d].y });
  }
  const pos = (c: RobotCell) => ({ x: c.x + 1, y: c.y + 1 });
  const label = [
    fmt(t.learn.robot.grid, { size, ...pos(start) }),
    ...markers.map((m) => fmt(t.learn.robot.star, { label: m.label, ...pos(m) })),
    ...(target ? [fmt(t.learn.robot.flag, pos(target))] : []),
    ...(pathSteps > 0 ? [t.learn.robot.path] : []),
  ].join(' ');
  const star = (cx: number, cy: number) =>
    Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 === 0 ? 24 : 11;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');
  return (
    <svg viewBox={`-4 -4 ${W + 8} ${W + 8}`} role="img" aria-label={label} className="mx-auto h-auto w-full max-w-sm" data-testid="robot-grid">
      {Array.from({ length: size * size }, (_, i) => (
        <rect key={i} x={(i % size) * C} y={Math.floor(i / size) * C} width={C} height={C} fill={(Math.floor(i / size) + i) % 2 ? '#F3E7D3' : '#FFFDF8'} stroke="#5B4636" strokeWidth={2} />
      ))}
      {pathSteps > 0 && (
        <polyline points={path.map((c) => `${mid(c.x)},${mid(c.y)}`).join(' ')} fill="none" stroke="#2f5370" strokeWidth={5} strokeDasharray="4 8" strokeLinecap="round" />
      )}
      {markers.map((m) => (
        <g key={m.label} data-marker={m.label}>
          <polygon points={star(mid(m.x), mid(m.y))} fill="#E9B949" stroke="#5B4636" strokeWidth={2} />
          <text x={mid(m.x)} y={mid(m.y) + 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#2E2620">{m.label}</text>
        </g>
      ))}
      {target && (
        <g data-testid="robot-flag">
          <line x1={mid(target.x) - 12} y1={mid(target.y) - 20} x2={mid(target.x) - 12} y2={mid(target.y) + 22} stroke="#2E2620" strokeWidth={4} />
          <polygon points={`${mid(target.x) - 12},${mid(target.y) - 20} ${mid(target.x) + 18},${mid(target.y) - 10} ${mid(target.x) - 12},${mid(target.y)}`} fill="#B5443A" />
        </g>
      )}
      <g data-testid="robot">
        <rect x={mid(start.x) - 18} y={mid(start.y) - 16} width={36} height={32} rx={8} fill="#5B4636" />
        <line x1={mid(start.x)} y1={mid(start.y) - 16} x2={mid(start.x)} y2={mid(start.y) - 24} stroke="#5B4636" strokeWidth={3} />
        <circle cx={mid(start.x) - 7} cy={mid(start.y) - 3} r={4} fill="#fff" />
        <circle cx={mid(start.x) + 7} cy={mid(start.y) - 3} r={4} fill="#fff" />
        <rect x={mid(start.x) - 8} y={mid(start.y) + 6} width={16} height={3} rx={1.5} fill="#fff" />
      </g>
    </svg>
  );
}
