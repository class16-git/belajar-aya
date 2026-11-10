/**
 * Prints the release manifest for a review threshold (default: production's "reviewed").
 *   pnpm release:manifest            → JSON with contentDigest and visible counts
 *   pnpm release:manifest -- --ids   → also lists the visible lesson, book and passage ids
 */
import { contentManifest } from '../src/manifest';
import type { ReviewStatus } from '../src/schema';

const args = process.argv.slice(2);
const min = (args.find((a) => a.startsWith('--min='))?.slice(6) ?? 'reviewed') as ReviewStatus;
const m = contentManifest(min);
const { ids, ...rest } = m;
console.log(JSON.stringify(args.includes('--ids') ? m : rest, null, 2));
void ids;
