import { type Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';
import {
  compareByCodeUnit,
  sha256Hex,
  sha256HexSchema,
  splitLineBytes,
} from './refounding-artefacts.js';
import { matchKeywordsInsensitive } from './refound-inventory-nets.js';

/**
 * The sweep net's data model (F1 §5 row `refound-sweep`): the fixed
 * non-terminal marker set and the `sweep/sweep-hits.v1.jsonl` record shape.
 * Pure — the filesystem-facing orchestration lives in
 * `refound-sweep-helpers.ts`.
 *
 * @remarks
 * The sweep is ONE raw keyword net over the freeze rule's `sweep`-verdict
 * surfaces (old archive, prompts, thread records) — deliberately blunt: no
 * fence logic, no structure parsing, every line of every scanned file is
 * matched. Hits are verbatim byte captures (D7) that form an F3
 * ADJUDICATION QUEUE — a hit is never auto-promoted, and a zero-hit sweep is
 * only as trustworthy as the marker-free paraphrase plant proves it to be
 * (P4; `refound-plant-orphan` plant 3 demonstrates the net's blindness
 * honestly).
 *
 * The marker set is placed judgement, drafted in the G1 packet §6, ratified
 * at G1, versioned here; changes are amendment + re-ratification +
 * discrimination-proof re-run.
 *
 * @packageDocumentation
 */

/** Sweep-hits artefact path relative to the artefact home (F1 §3). */
export const SWEEP_HITS_SEGMENT = 'sweep/sweep-hits.v1.jsonl';

/**
 * The sweep-net non-terminal marker set, v1 — the G1 packet §6 candidate
 * list verbatim, in packet order. Case-insensitive MATCH, verbatim CAPTURE;
 * frozen at G1.
 */
export const SWEEP_MARKERS_V1 = [
  'todo',
  'next step',
  'not yet',
  'pending',
  'blocked',
  'open question',
  'unresolved',
  'follow-up',
  'deferred',
  'still needs',
  'remaining',
  'incomplete',
  'carry-over',
  'promotion trigger',
  'reopen',
] as const;

const nonEmptyString = z.string().min(1);

/**
 * One `sweep/sweep-hits.v1.jsonl` record: a verbatim marker-bearing line on
 * a live sweep surface. `file` is repo-root-relative POSIX (sweep surfaces
 * are live, not frozen).
 */
const sweepHitSchema = z.strictObject({
  file: nonEmptyString,
  line: z.number().int().positive(),
  markers: z.array(nonEmptyString).min(1),
  text: z.string(),
  sha256: sha256HexSchema,
});
export type SweepHit = z.infer<typeof sweepHitSchema>;

/** Parse an unknown value as a {@link SweepHit} at the read boundary. */
export const parseSweepHit = (value: unknown): Result<SweepHit, Error> =>
  parseWithSchema({ label: 'sweep hit', schema: sweepHitSchema, value });

/**
 * Run the sweep net over one file's raw bytes: LF-split, case-insensitive
 * marker MATCH, verbatim byte CAPTURE with the raw line's SHA-256.
 */
export function buildSweepHits(file: string, bytes: Uint8Array): readonly SweepHit[] {
  const hits: SweepHit[] = [];
  const lineBytes = splitLineBytes(bytes);
  for (let index = 0; index < lineBytes.length; index += 1) {
    const raw = lineBytes[index] ?? new Uint8Array();
    const text = Buffer.from(raw).toString('utf8');
    const markers = matchKeywordsInsensitive(text, SWEEP_MARKERS_V1);
    if (markers.length > 0) {
      hits.push({ file, line: index + 1, markers: [...markers], text, sha256: sha256Hex(raw) });
    }
  }
  return hits;
}

/** Sort hits by (file, line) — the determinism contract's record order. */
export function sortSweepHits(hits: readonly SweepHit[]): readonly SweepHit[] {
  return [...hits].sort((a, b) => compareByCodeUnit(a.file, b.file) || a.line - b.line);
}
