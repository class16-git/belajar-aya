import 'server-only';
import { findExpansionItem, getExpansion, isExpansionVisible, pipelineState, type PipelineState, type Reading, type Unit } from '@atlas/curriculum';
import { config } from './config';

/**
 * Expansion units and readings for the PARENT area only. Children never reach these views: every page using them is
 * behind `requireParentPage`, and answer keys are rendered server-side for grown-ups. Items not yet visible to children
 * under `config.minReview` are still listed here (review context) and labelled "Not yet shown to children".
 */
export type ExpansionKind = 'unit' | 'reading';

export interface ExpansionEntry<T extends Unit | Reading = Unit | Reading> {
  kind: ExpansionKind;
  item: T;
  state: PipelineState;
  /** Visible to children in this deployment (production: human review + scholar approval where needed). */
  visibleToChildren: boolean;
  /** Islamic or Arabic content: publication additionally needs a qualified scholar. */
  religious: boolean;
  scholarApproved: boolean;
  /** Validator errors that mention this item. */
  errors: string[];
}

export function isReligious(x: Unit | Reading): boolean {
  return ('framework' in x && x.framework === 'islamic') || x.arabicPhrases.length > 0 || ('crossCurricular' in x && x.crossCurricular.some((c) => c.subject === 'islamic_values'));
}

const mentions = (e: string, id: string) => new RegExp(`(^|[^a-z0-9_-])${id.replace(/[-]/g, '\\-')}([^a-z0-9_-]|$)`).test(e);

function entry<T extends Unit | Reading>(kind: ExpansionKind, item: T, errors: string[]): ExpansionEntry<T> {
  const religious = isReligious(item);
  const rr = item.religiousReview;
  return {
    kind,
    item,
    state: pipelineState(item, errors),
    // A recorded rejection always hides an item, whatever its review status.
    visibleToChildren: isExpansionVisible(item, config.minReview) && !item.review.rejectedReason,
    religious,
    scholarApproved: !!(rr && rr.approvalStatus === 'approved' && rr.scholarReviewer && rr.reviewedAt),
    errors: errors.filter((e) => mentions(e, item.id)),
  };
}

/** Every level (browse and review pages). Content chunks are loaded on demand, per level, and cached. */
export async function expansionView() {
  const { units, readings, errors } = await getExpansion();
  return {
    units: units.map((u) => entry('unit', u, errors)),
    readings: readings.map((r) => entry('reading', r, errors)),
  };
}

/** One item: loads only its level's chunk. */
export async function findExpansion(id: string): Promise<ExpansionEntry | undefined> {
  const found = await findExpansionItem(id);
  if (!found) return undefined;
  return entry(found.item.id.startsWith('unit-') ? 'unit' : 'reading', found.item, found.errors);
}

/** Only items that passed every automated check and still await a person can receive a decision. */
export const isReviewable = (e: ExpansionEntry) => e.state === 'subject_validated';
