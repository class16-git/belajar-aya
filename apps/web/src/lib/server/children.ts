import 'server-only';
import { z } from 'zod';
import {
  ageTransitionNotices,
  CHILD_MODES,
  exactCalendarAge,
  isValidIsoDate,
  isValidTimeZone,
  localDateInTimeZone,
  safetyPolicy,
  type CalendarAge,
} from '@atlas/shared';
import { getCatalog } from '@atlas/curriculum';
import type { ChildProfile } from '@atlas/database';

export const GRADES = ['Toddler', 'Preschool', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'] as const;

export const TIMEZONES = [
  'Asia/Jakarta',
  'Asia/Makassar',
  'Asia/Jayapura',
  'Asia/Singapore',
  'Asia/Kuala_Lumpur',
  'Australia/Sydney',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'UTC',
] as const;

export const isoFromDbDate = (d: Date | null): string | null => (d ? d.toISOString().slice(0, 10) : null);

export interface AgeContext {
  localDate: string;
  timezone: string;
  age: CalendarAge | null;
  policy: ReturnType<typeof safetyPolicy>;
  notices: ReturnType<typeof ageTransitionNotices>;
}

/** Recomputed on every request from the trusted server clock and the learner's IANA timezone. */
export function ageContext(child: ChildProfile, now = new Date()): AgeContext {
  const tz = isValidTimeZone(child.timezone) ? child.timezone : 'Asia/Jakarta';
  const localDate = localDateInTimeZone(now, tz);
  const dob = isoFromDbDate(child.dateOfBirth);
  let age: CalendarAge | null = null;
  if (dob) {
    try {
      age = exactCalendarAge(dob, localDate);
    } catch {
      age = null; // e.g. DOB later than local date due to clock skew: treat as unknown (conservative)
    }
  }
  const policy = safetyPolicy(age, child.mode);
  const notices = child.transitionAcknowledged ? [] : ageTransitionNotices(age, child.mode);
  return { localDate, timezone: tz, age, policy, notices };
}

const nickname = z.string().trim().min(1).max(40).regex(/^[^<>{}]*$/);
const skillIds = () => new Set(getCatalog().skills.map((s) => s.id));

export const childInputSchema = z
  .object({
    nickname,
    dateOfBirth: z
      .string()
      .nullable()
      .optional()
      .transform((v) => (v ? v : null))
      .refine((v) => v === null || isValidIsoDate(v), 'INVALID_DOB'),
    timezone: z.string().refine(isValidTimeZone, 'INVALID_TIMEZONE'),
    schoolGrade: z.enum(GRADES).nullable(),
    mode: z.enum(CHILD_MODES),
    locale: z.enum(['en', 'id']),
    itemsPerSession: z.number().int().min(3).max(10).default(5),
    targetMinutes: z.number().int().min(5).max(30).default(15),
    audioEnabled: z.boolean().default(false),
    reducedMotion: z.boolean().default(false),
    focusSkillId: z
      .string()
      .nullable()
      .default(null)
      .refine((v) => v === null || skillIds().has(v), 'UNKNOWN_SKILL'),
    confirmSensitive: z.boolean().optional(),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.dateOfBirth) {
      const today = localDateInTimeZone(new Date(), v.timezone);
      if (v.dateOfBirth > today) ctx.addIssue({ code: 'custom', message: 'INVALID_DOB', path: ['dateOfBirth'] });
    }
  });
export type ChildInput = z.infer<typeof childInputSchema>;

export function toChildData(v: ChildInput) {
  const { confirmSensitive: _c, dateOfBirth, ...rest } = v;
  return { ...rest, dateOfBirth: dateOfBirth ? new Date(`${dateOfBirth}T00:00:00Z`) : null };
}
