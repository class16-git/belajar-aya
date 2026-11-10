import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  AgeError,
  currentAge,
  exactCalendarAge,
  localDateInTimeZone,
  msUntilNextLocalMidnight,
} from './age';
import { ageTransitionNotices, safetyPolicy } from './safety';

const age = (dob: string, on: string) => {
  const a = exactCalendarAge(dob, on);
  return `${a.years}y ${a.months}m ${a.days}d`;
};

describe('exactCalendarAge — acceptance cases (synthetic)', () => {
  it('toddler: 2024-05-20 on 2026-11-10 => 2y 5m 21d', () => {
    expect(age('2024-05-20', '2026-11-10')).toBe('2y 5m 21d');
  });
  it('grade 1: 2019-08-15 on 2026-11-10 => 7y 2m 26d', () => {
    expect(age('2019-08-15', '2026-11-10')).toBe('7y 2m 26d');
  });
});

describe('exactCalendarAge — calendar edge cases', () => {
  it('advances exactly on the birthday, not the day before', () => {
    expect(age('2023-11-10', '2026-11-09')).toBe('2y 11m 30d');
    expect(age('2023-11-10', '2026-11-10')).toBe('3y 0m 0d');
  });
  it('same day of birth is 0y 0m 0d', () => {
    expect(age('2026-01-01', '2026-01-01')).toBe('0y 0m 0d');
  });
  it('handles month ends (31st born, short months)', () => {
    expect(age('2020-01-31', '2020-02-29')).toBe('0y 1m 0d');
    expect(age('2020-01-31', '2020-03-30')).toBe('0y 1m 30d');
    expect(age('2020-01-31', '2020-03-31')).toBe('0y 2m 0d');
    expect(age('2021-01-31', '2021-02-28')).toBe('0y 1m 0d');
  });
  it('leap-day birth: anniversary clamps to Feb 28 in common years', () => {
    expect(age('2020-02-29', '2021-02-27')).toBe('0y 11m 29d');
    expect(age('2020-02-29', '2021-02-28')).toBe('1y 0m 0d');
    expect(age('2020-02-29', '2024-02-29')).toBe('4y 0m 0d');
  });
  it('counts days across a leap February correctly', () => {
    expect(age('2024-01-30', '2024-03-01')).toBe('0y 1m 1d');
  });
  it('rejects a DOB in the future', () => {
    expect(() => exactCalendarAge('2027-01-01', '2026-11-10')).toThrow(AgeError);
  });
  it('rejects invalid dates', () => {
    expect(() => exactCalendarAge('2023-02-30', '2026-11-10')).toThrow(AgeError);
    expect(() => exactCalendarAge('20230101', '2026-11-10')).toThrow(AgeError);
  });
});

describe('timezone-aware local date', () => {
  it('uses learner-local calendar date, not UTC', () => {
    // 2026-11-09T17:30Z is already 2026-11-10 00:30 in Asia/Jakarta (UTC+7)
    const now = new Date('2026-11-09T17:30:00Z');
    expect(localDateInTimeZone(now, 'Asia/Jakarta')).toBe('2026-11-10');
    expect(localDateInTimeZone(now, 'UTC')).toBe('2026-11-09');
  });
  it('does not advance the birthday early near a timezone boundary', () => {
    const dob = '2023-11-10';
    const beforeMidnightJakarta = new Date('2026-11-09T16:59:00Z'); // 23:59 local
    const afterMidnightJakarta = new Date('2026-11-09T17:00:00Z'); // 00:00 local
    expect(currentAge(dob, 'Asia/Jakarta', beforeMidnightJakarta).age.years).toBe(2);
    expect(currentAge(dob, 'Asia/Jakarta', afterMidnightJakarta).age.years).toBe(3);
    // Same instant in New York is still Nov 9 → not yet 3.
    expect(currentAge(dob, 'America/New_York', afterMidnightJakarta).age.years).toBe(2);
  });
  it('rejects unknown timezones', () => {
    expect(() => localDateInTimeZone(new Date(), 'Mars/Olympus')).toThrow(AgeError);
  });
  it('computes time to next local midnight, including across DST changes', () => {
    const jkt = msUntilNextLocalMidnight(new Date('2026-11-09T16:00:00Z'), 'Asia/Jakarta');
    expect(jkt).toBe(60 * 60 * 1000); // 23:00 local → 1h
    // US DST ends 2026-11-01 02:00 local; 2026-10-31T23:00 local (EDT) → midnight is 1h away.
    const ny = msUntilNextLocalMidnight(new Date('2026-11-01T03:00:00Z'), 'America/New_York');
    expect(ny).toBe(60 * 60 * 1000);
    // Day of DST end is 25h long: from 00:00 Nov 1 local, next midnight is 25h later.
    const nyLong = msUntilNextLocalMidnight(new Date('2026-11-01T04:00:00Z'), 'America/New_York');
    expect(nyLong).toBe(25 * 60 * 60 * 1000);

    // Review finding F7 (not reproducible): start times with seconds/ms still land exactly on local midnight.
    for (const [iso, tz] of [
      ['2026-11-09T16:30:30.250Z', 'Asia/Jakarta'],
      ['2026-11-10T04:59:59.999Z', 'America/New_York'],
      ['2026-04-04T10:30:30Z', 'Pacific/Auckland'], // NZ DST ends 2026-04-05
    ] as const) {
      const now = new Date(iso);
      const at = new Date(now.getTime() + msUntilNextLocalMidnight(now, tz));
      const hms = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(at);
      expect(hms).toBe('00:00:00');
      expect(at.getUTCMilliseconds()).toBe(0);
      expect(localDateInTimeZone(at, tz)).not.toBe(localDateInTimeZone(now, tz));
      expect(localDateInTimeZone(new Date(at.getTime() - 1), tz)).toBe(localDateInTimeZone(now, tz));
    }
  });
});

describe('safety policy and transitions', () => {
  it('under 3 forbids independent screen activities regardless of mode', () => {
    const p = safetyPolicy(exactCalendarAge('2024-05-20', '2026-11-10'), 'ELEMENTARY_GUIDED');
    expect(p.band).toBe('under3');
    expect(p.childScreenActivitiesAllowed).toBe(false);
    expect(p.smallPartsForbidden).toBe(true);
  });
  it('grade 1 learner may use guided interactive practice', () => {
    const p = safetyPolicy(exactCalendarAge('2019-08-15', '2026-11-10'), 'ELEMENTARY_GUIDED');
    expect(p.childScreenActivitiesAllowed).toBe(true);
  });
  it('toddler mode stays offline even after turning 3, and only proposes a change', () => {
    const at3 = exactCalendarAge('2023-11-10', '2026-11-10');
    expect(safetyPolicy(at3, 'TODDLER_OFFLINE').childScreenActivitiesAllowed).toBe(false);
    expect(ageTransitionNotices(at3, 'TODDLER_OFFLINE')).toEqual([
      { code: 'TURNED_3_OFFER_NEW_ACTIVITIES', requiresParentConfirmation: true },
    ]);
    expect(ageTransitionNotices(exactCalendarAge('2023-11-11', '2026-11-10'), 'TODDLER_OFFLINE')).toEqual([]);
  });
  it('unknown DOB is treated conservatively for small parts', () => {
    expect(safetyPolicy(null, 'ELEMENTARY_GUIDED').smallPartsForbidden).toBe(true);
  });
});

// Real learner acceptance cases run ONLY on the owner's machine, from the git-ignored private file.
const privatePath = join(import.meta.dirname, '../../../config/learners.private.json');
describe.skipIf(!existsSync(privatePath))('private learner fixtures (local only)', () => {
  it('matches expected ages recorded in the private config', () => {
    const cfg = JSON.parse(readFileSync(privatePath, 'utf8')) as {
      learners: { dateOfBirth: string; expectedAge?: { on: string; value: string } }[];
    };
    for (const l of cfg.learners) {
      if (l.expectedAge) expect(age(l.dateOfBirth, l.expectedAge.on)).toBe(l.expectedAge.value);
    }
  });
});
