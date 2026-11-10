/**
 * Exact, timezone-aware chronological age.
 *
 * Rules (docs/spec/product/LEARNER_PROFILES_AGE_ENGINE.md):
 * - DOB is a calendar DATE (YYYY-MM-DD), never a timestamp.
 * - "Today" is the learner-local calendar date computed from a trusted server clock + IANA timezone.
 * - Age uses calendar arithmetic (month lengths, leap years), never days/365.
 * - Leap-day births: in non-leap years the monthly/yearly anniversary is clamped to Feb 28.
 */
export type IsoDate = string; // YYYY-MM-DD

export interface CalendarAge {
  years: number;
  months: number;
  days: number;
  /** Completed months since birth. */
  totalMonths: number;
}

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export class AgeError extends Error {
  constructor(
    public readonly code: 'INVALID_DATE' | 'INVALID_TIMEZONE' | 'DOB_IN_FUTURE',
    message: string,
  ) {
    super(message);
    this.name = 'AgeError';
  }
}

interface Ymd {
  y: number;
  m: number; // 1-12
  d: number;
}

export function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(y: number, m: number): number {
  return [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1] ?? 0;
}

export function parseIsoDate(value: string): Ymd {
  const match = ISO_RE.exec(value);
  if (!match) throw new AgeError('INVALID_DATE', `Not an ISO calendar date: ${value}`);
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m) || y < 1900) {
    throw new AgeError('INVALID_DATE', `Invalid calendar date: ${value}`);
  }
  return { y, m, d };
}

export function isValidIsoDate(value: string): boolean {
  try {
    parseIsoDate(value);
    return true;
  } catch {
    return false;
  }
}

const pad = (n: number, w = 2) => String(n).padStart(w, '0');
export const formatIsoDate = ({ y, m, d }: Ymd): IsoDate => `${pad(y, 4)}-${pad(m)}-${pad(d)}`;

function compareYmd(a: Ymd, b: Ymd): number {
  return a.y - b.y || a.m - b.m || a.d - b.d;
}

/** Add whole months, clamping the day to the target month's length. */
function addMonthsClamped(base: Ymd, months: number): Ymd {
  const zeroBased = base.y * 12 + (base.m - 1) + months;
  const y = Math.floor(zeroBased / 12);
  const m = (zeroBased % 12) + 1;
  return { y, m, d: Math.min(base.d, daysInMonth(y, m)) };
}

function toEpochDay({ y, m, d }: Ymd): number {
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** The learner-local calendar date at instant `now` in IANA timezone `tz`. */
export function localDateInTimeZone(now: Date, tz: string): IsoDate {
  if (!isValidTimeZone(tz)) throw new AgeError('INVALID_TIMEZONE', `Unknown IANA timezone: ${tz}`);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** Exact age in completed years, months and days on the given local calendar date. */
export function exactCalendarAge(dob: IsoDate, onDate: IsoDate): CalendarAge {
  const birth = parseIsoDate(dob);
  const on = parseIsoDate(onDate);
  if (compareYmd(birth, on) > 0) {
    throw new AgeError('DOB_IN_FUTURE', 'Date of birth is after the reference date');
  }
  let totalMonths = (on.y - birth.y) * 12 + (on.m - birth.m);
  if (compareYmd(addMonthsClamped(birth, totalMonths), on) > 0) totalMonths -= 1;
  const anniversary = addMonthsClamped(birth, totalMonths);
  const days = toEpochDay(on) - toEpochDay(anniversary);
  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12, days, totalMonths };
}

/** Age for a learner "now" — the single entry point servers should use. */
export function currentAge(
  dob: IsoDate,
  tz: string,
  now: Date,
): { localDate: IsoDate; age: CalendarAge } {
  const localDate = localDateInTimeZone(now, tz);
  return { localDate, age: exactCalendarAge(dob, localDate) };
}

/**
 * Milliseconds until the next learner-local midnight (used to re-check age while a session stays open).
 * Handles DST by searching forward minute-precision for the local date change.
 */
export function msUntilNextLocalMidnight(now: Date, tz: string): number {
  const today = localDateInTimeZone(now, tz);
  // Coarse search by hour, then refine by minute; local days are 23–25h long.
  let t = now.getTime();
  const hour = 3_600_000;
  for (let i = 0; i < 26; i++) {
    if (localDateInTimeZone(new Date(t + hour), tz) !== today) break;
    t += hour;
  }
  for (let i = 0; i < 61; i++) {
    if (localDateInTimeZone(new Date(t + 60_000), tz) !== today) break;
    t += 60_000;
  }
  // Floor the instant to the minute boundary that starts the new day.
  const next = Math.ceil((t + 1) / 60_000) * 60_000;
  return Math.max(1, next - now.getTime());
}
