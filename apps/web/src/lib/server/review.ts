import 'server-only';
import { z } from 'zod';
import { prisma } from '@atlas/database';
import { HttpError } from './http';
import { isReviewable, type ExpansionEntry } from './expansion';

/** Reviewer initials: letters (any script), spaces, dots, apostrophes and hyphens. Never markup. */
export const INITIALS = /^\p{L}[\p{L} .'’-]{0,39}$/u;
const SAFE = /^[^<>]*$/;

export const decisionSchema = z
  .object({
    itemId: z.string().regex(/^(unit|reading)-[a-z0-9_-]+$/).max(120),
    itemVersion: z.string().regex(/^\d+\.\d+\.\d+$/).max(20),
    decision: z.enum(['approve', 'reject']),
    reviewerName: z.string().trim().min(1).max(40).regex(INITIALS),
    reviewerRole: z.enum(['parent', 'educator']),
    note: z.string().trim().max(400).regex(SAFE).default(''),
  })
  .strict()
  .refine((d) => d.decision !== 'reject' || d.note.length >= 3, { message: 'A rejection needs a reason', path: ['note'] });
export type DecisionInput = z.infer<typeof decisionSchema>;

/**
 * Server-side checks beyond the schema: the item exists (404, no enumeration of hidden ids), the reviewer saw the
 * current version (409), and the item is actually awaiting human review with zero validation errors (409).
 */
export function assertDecisionAllowed(entry: ExpansionEntry | undefined, body: DecisionInput): ExpansionEntry {
  if (!entry) throw new HttpError(404, 'NOT_FOUND');
  if (entry.item.version !== body.itemVersion) throw new HttpError(409, 'VERSION_MISMATCH');
  if (!isReviewable(entry) || entry.errors.length > 0) throw new HttpError(409, 'NOT_REVIEWABLE');
  return entry;
}

export interface DecisionRow {
  itemId: string;
  itemVersion: string;
  decision: 'approve' | 'reject';
  reviewerName: string;
  reviewerRole: 'parent' | 'educator';
  note: string;
  createdAt: Date;
}

/** All of one family's decisions, oldest first. Always scoped by familyId. */
export function familyDecisions(familyId: string): Promise<DecisionRow[]> {
  return prisma.contentReviewDecision.findMany({
    where: { familyId },
    orderBy: { createdAt: 'asc' },
    select: { itemId: true, itemVersion: true, decision: true, reviewerName: true, reviewerRole: true, note: true, createdAt: true },
  });
}

/** Latest decision per item. */
export function latestByItem(rows: DecisionRow[]): Map<string, DecisionRow> {
  const m = new Map<string, DecisionRow>();
  for (const r of rows) m.set(r.itemId, r);
  return m;
}

export const EXPORT_FORMAT = 'atlas-review-decisions';

export function exportDecisions(rows: DecisionRow[], kindOf: (id: string) => 'unit' | 'reading' | null, now = new Date()) {
  return {
    format: EXPORT_FORMAT,
    formatVersion: 1,
    exportedAt: now.toISOString(),
    notice: 'Content reviews only. These decisions are never a religious or scholarly approval.',
    decisions: rows.map((r) => ({
      itemId: r.itemId,
      itemKind: kindOf(r.itemId),
      itemVersion: r.itemVersion,
      decision: r.decision,
      reviewerName: r.reviewerName,
      reviewerRole: r.reviewerRole,
      note: r.note,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}
