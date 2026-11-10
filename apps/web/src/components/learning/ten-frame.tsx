'use client';
import { fmt } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n/client';

/**
 * Original ten-frame manipulative.
 * - mode "fill": `filled` fixed counters; child taps empty spaces to place counters (make-ten).
 * - mode "count": child taps counters to mark them as counted.
 * - mode "static": display only.
 * - `second`: a second group of fixed counters after the first (addition); drawn with a ring, not colour alone.
 * - `crossed`: the last `crossed` fixed counters are crossed out (take-away subtraction) and cannot be counted.
 * - `capacity`: cells beyond this are marked "not used" and can never be filled, so a part–whole scaffold shows
 *   exactly whole − part spaces (audit ATL-03). Defaults to all cells.
 * Correctness is never shown by colour alone: placed/counted counters also get a mark.
 */
export function TenFrame({
  filled,
  frames = 1,
  mode,
  marked,
  onToggle,
  highlightEmpty = false,
  disabled = false,
  second = 0,
  crossed = 0,
  capacity,
}: {
  filled: number;
  frames?: 1 | 2;
  mode: 'fill' | 'count' | 'static';
  marked: Set<number>;
  onToggle?: (index: number) => void;
  highlightEmpty?: boolean;
  disabled?: boolean;
  second?: number;
  crossed?: number;
  capacity?: number;
}) {
  const { t } = useI18n();
  const total = frames * 10;
  const cap = Math.min(capacity ?? total, total);
  const fixed = filled + second;
  return (
    <div className="flex flex-col gap-3" role="group" aria-label={fmt(t.learn.a11y.tenFrame, { filled: mode === 'fill' ? filled + marked.size : fixed, total })}>
      {Array.from({ length: frames }, (_, f) => (
        <div key={f} className="grid grid-cols-5 gap-1.5 rounded-2xl border-4 border-bark bg-linen p-1.5 sm:gap-2 sm:p-2">
          {Array.from({ length: 10 }, (_, j) => {
            const i = f * 10 + j;
            const isFixed = i < fixed;
            const isSecond = i >= filled && i < fixed;
            const isCrossed = crossed > 0 && i >= fixed - crossed && i < fixed;
            const isMarked = marked.has(i);
            const unused = !isFixed && i >= cap;
            if (unused) {
              return (
                <span key={i} role="img" aria-label={t.learn.a11y.unusedCell} data-cell="unused"
                  className="flex aspect-square min-h-11 items-center justify-center rounded-xl border-2 border-dashed border-sand bg-linen/60">
                  <span aria-hidden="true" className="text-lg text-muted">·</span>
                </span>
              );
            }
            const interactive = !disabled && ((mode === 'fill' && !isFixed) || (mode === 'count' && isFixed && !isCrossed));
            const label = isCrossed
              ? fmt(t.learn.a11y.takenCounter, { n: i + 1 })
              : isFixed
              ? mode === 'count' && isMarked
                ? fmt(t.learn.a11y.counterCounted, { n: i + 1 })
                : fmt(isSecond ? t.learn.a11y.secondCounter : t.learn.a11y.filledCell, { n: i + 1 })
              : isMarked
                ? fmt(t.learn.a11y.placedCell, { n: i + 1 })
                : fmt(t.learn.a11y.emptyCell, { n: i + 1 });
            const counter = isFixed ? (
              <span
                data-counter={isCrossed ? 'taken' : isSecond ? 'second' : 'first'}
                className={`relative block h-[72%] w-[72%] rounded-full shadow-inner ${isSecond ? 'border-[5px] border-white bg-bead-blue outline outline-[3px] outline-bead-blue' : 'bg-bead-red'} ${isCrossed ? 'opacity-40' : ''} ${mode === 'count' && isMarked ? 'ring-4 ring-sage-dark ring-offset-2 ring-offset-white' : ''}`}
              >
                {mode === 'count' && isMarked && <Check />}
                {isCrossed && <Cross />}
              </span>
            ) : isMarked ? (
              <span className="relative block h-[72%] w-[72%] rounded-full bg-bead-blue shadow-inner"><Plus /></span>
            ) : interactive && mode === 'fill' ? (
              <span aria-hidden="true" className="block h-[60%] w-[60%] rounded-full border-[3px] border-dashed border-sand" />
            ) : null;
            const cls = `flex aspect-square min-h-11 items-center justify-center rounded-xl bg-white transition-transform duration-calm ${highlightEmpty && !isFixed && !isMarked ? 'outline-dashed outline-[3px] outline-clay' : ''}`;
            return interactive ? (
              <button key={i} type="button" aria-label={label} aria-pressed={isMarked} onClick={() => onToggle?.(i)} data-cell={mode === 'fill' && !isMarked ? 'fillable' : undefined}
                className={`${cls} cursor-pointer hover:bg-paper focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-focus active:scale-95`}>
                {counter}
              </button>
            ) : (
              <span key={i} role="img" aria-label={label} className={cls}>{counter}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="absolute inset-0 m-auto h-1/2 w-1/2" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Cross() {
  return (
    <svg viewBox="0 0 24 24" className="absolute -inset-1 m-auto h-[115%] w-[115%]" aria-hidden="true">
      <path d="M4 4l16 16M20 4L4 20" stroke="#2E2620" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
function Plus() {
  return (
    <svg viewBox="0 0 24 24" className="absolute inset-0 m-auto h-1/2 w-1/2" aria-hidden="true">
      <path d="M12 6v12M6 12h12" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
