import { STAGES, type Stage } from '@atlas/shared';
import { EXPANSION_LEVEL_LOADERS, EXPANSION_SUMMARY } from './content-index';
import type { ReviewStatus } from './schema';
import { parseExpansionItems, type ExpansionContent, type PipelineState, type Reading, type Unit } from './units';

/**
 * Expansion content at runtime, loaded per level (ADR: scale to 3,000 items without one giant bundle).
 *
 * - `expansionSummary()` is a small, synchronous, precomputed index: one row per item with its level, framework or
 *   genre, version, review status, pipeline state, visibility at each review threshold and a content hash. Health,
 *   the release manifest and the dashboards use only this.
 * - `loadExpansionLevel(level)` dynamically imports ONE level's content (a separate chunk) and parses it.
 * - The whole-corpus validator (prerequisites, cycles, near-duplicates) runs in CI and in the indexer; its errors are
 *   stored in the summary and attached to the items they mention.
 */
export interface ExpansionSummaryItem {
  id: string;
  kind: 'unit' | 'reading';
  level: Stage;
  framework: string | null;
  genre: string | null;
  version: string;
  reviewStatus: ReviewStatus;
  religious: boolean;
  state: PipelineState;
  visibleAt: Record<ReviewStatus, boolean>;
  hash: string;
}
export interface ExpansionSummary {
  items: ExpansionSummaryItem[];
  /** Whole-corpus validator errors at index time (CI requires none). */
  errors: string[];
}

export const expansionSummary = (): ExpansionSummary => EXPANSION_SUMMARY as ExpansionSummary;

export const levelOfId = (id: string): Stage | null => {
  const l = id.split('-')[1] as Stage | undefined;
  return l && (STAGES as readonly string[]).includes(l) ? l : null;
};

const mentions = (e: string, id: string) => new RegExp(`(^|[^a-z0-9_-])${id.replace(/[-]/g, '\\-')}([^a-z0-9_-]|$)`).test(e);

const cache = new Map<Stage, Promise<ExpansionContent & { errors: string[] }>>();
/** One level's units and readings, parsed and checked item by item, plus corpus errors that mention them. */
export function loadExpansionLevel(level: Stage): Promise<ExpansionContent & { errors: string[] }> {
  let p = cache.get(level);
  if (!p) {
    p = EXPANSION_LEVEL_LOADERS[level]!().then((raw) => {
      const { content, errors } = parseExpansionItems(raw);
      const ids = [...content.units, ...content.readings].map((x) => x.id);
      const corpus = expansionSummary().errors.filter((e) => ids.some((id) => mentions(e, id)));
      return { ...content, errors: [...errors, ...corpus.filter((e) => !errors.includes(e))] };
    });
    cache.set(level, p);
  }
  return p;
}

/** All levels (parent browse and review pages, scripts). Prefer `loadExpansionLevel` when one level is enough. */
export async function getExpansion(): Promise<ExpansionContent & { errors: string[] }> {
  const parts = await Promise.all(STAGES.map((s) => loadExpansionLevel(s)));
  return { units: parts.flatMap((p) => p.units), readings: parts.flatMap((p) => p.readings), errors: parts.flatMap((p) => p.errors) };
}

export async function findExpansionItem(id: string): Promise<{ item: Unit | Reading; errors: string[] } | null> {
  const level = levelOfId(id);
  if (!level) return null;
  const l = await loadExpansionLevel(level);
  const item = [...l.units, ...l.readings].find((x) => x.id === id);
  return item ? { item, errors: l.errors.filter((e) => mentions(e, id)) } : null;
}

/** Raw files for every level (tests and validation scripts). */
export async function loadRawExpansion(): Promise<{ units: unknown[]; readings: unknown[] }> {
  const parts = await Promise.all(STAGES.map((s) => EXPANSION_LEVEL_LOADERS[s]!()));
  return { units: parts.flatMap((p) => p.units), readings: parts.flatMap((p) => p.readings) };
}
