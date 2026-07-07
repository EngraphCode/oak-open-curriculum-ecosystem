import { createHash } from 'node:crypto';

import { err, ok, type Result } from '@oaknational/result';
import { z } from 'zod';

import { parseWithSchema } from '../core/schema-parse.js';
import { compareByCodeUnit, sha256Hex } from './refounding-artefacts.js';
import { ledgerRowSchema } from './refound-ledger-row.js';

/**
 * Pure logic for `refound-plant-challenge-canary` — the P4/B1/M5 sealed
 * planted-loss tooling: ledger-row and artefact shapes, salted rate-derived
 * deterministic plant selection, plausible-but-wrong variant derivation,
 * the hash-commit-then-reveal key mechanics, and the all-plants-caught
 * scoring rule.
 *
 * @remarks
 * The challenge layer's own prove-it-fires tooling (plan P4, cross-estate
 * review B1): a declared rate of ledger rows is re-issued into the batch's
 * challenge stream with their `binding` (the spec-detail contract)
 * KNOWINGLY re-pointed at a WRONG but well-formed frozen span — plausible
 * on the surface, wrong in substance, so NO mechanical scan of the stream
 * alone separates planted from real rows. The point (invariant B1) is
 * distinguishing a blind challenger fleet from a seeing one: only a
 * challenger that actually verifies bindings against the frozen spans
 * catches a plant. Two contamination holes are closed by construction (M5):
 * the stream carries no surface tell (no empty or malformed binding), and
 * the selection is NOT publicly recomputable from the stream plus a known
 * rate, because a sealed dispatcher SALT sits inside the selection-hash
 * domain. The salt travels ONLY in the dispatcher-held key set, under the
 * `sha256` commitment made BEFORE the batch and revealed after. A batch
 * challenge pass is acceptable ONLY if every plant was caught: a
 * zero-findings pass on a well-authored batch is otherwise indistinguishable
 * from a blind one.
 *
 * Everything here is deterministic: no clock, no randomness — plant and
 * donor selection derive from stable salted per-row hashes against the
 * declared rate, so identical inputs (salt included) always seed identical
 * challenges.
 *
 * @packageDocumentation
 */

/** Challenge-stream artefact path relative to the artefact home. */
export const CHALLENGE_STREAM_SEGMENT = 'challenge/challenge-stream.v1.jsonl';

/** Commitment artefact path relative to the artefact home. */
export const CHALLENGE_COMMITMENT_SEGMENT = 'challenge/challenge-commitment.v1.json';

const nonEmptyString = z.string().min(1);
const sha256HexSchema = z.string().regex(/^[0-9a-f]{64}$/);

/**
 * One ledger row as the challenge tooling consumes it: the CANONICAL v1 row
 * schema (`refound-ledger-row.ts`) tightened at THIS boundary with the
 * non-empty-`binding` requirement — a challenge-boundary rule, not a
 * row-schema rule. An input row with no binding would be indistinguishable
 * from a plant, so binding-less rows (including the emitter's sentinel
 * `default-block` rows) are refused here.
 */
const challengeLedgerRowSchema = z.strictObject({
  ...ledgerRowSchema.shape,
  binding: nonEmptyString,
});
export type ChallengeLedgerRow = z.infer<typeof challengeLedgerRowSchema>;

/** Parse an unknown value as a {@link ChallengeLedgerRow} at the read boundary. */
export const parseChallengeLedgerRow = (value: unknown): Result<ChallengeLedgerRow, Error> =>
  parseWithSchema({ label: 'challenge ledger row', schema: challengeLedgerRowSchema, value });

/** A stream row: a ledger row whose binding MAY be a planted wrong one. */
export type ChallengeStreamRow = Omit<ChallengeLedgerRow, 'binding'> & { binding: string };

/** A row's own frozen-span reference, the binding's citation prefix. */
function spanReference(row: ChallengeLedgerRow): string {
  return `${row.file}:${String(row.line_start)}-${String(row.line_end)}`;
}

const LEADING_SPAN_REFERENCE_PATTERN = /^\S+:\d+-\d+(?=\s|$)/;

/**
 * Derive the planted-loss variant of a row: the binding KNOWINGLY
 * re-pointed at the donor row's frozen span — well-formed and plausible on
 * the surface (a real span citation, the row's own detail text kept), wrong
 * in substance. NEVER an empty binding: an empty or malformed binding would
 * be a mechanical stream-local tell (M5). Every other field verbatim.
 */
export function derivePlantedVariant(
  row: ChallengeLedgerRow,
  donor: ChallengeLedgerRow,
): ChallengeStreamRow {
  const tail = row.binding.replace(LEADING_SPAN_REFERENCE_PATTERN, '');
  const separator = tail === '' || tail.startsWith(' ') ? '' : ' ';
  return { ...row, binding: `${spanReference(donor)}${separator}${tail}` };
}

const SELECTION_DOMAIN = 'refound-challenge-v1';
const BASIS_POINT_SCALE = 10000;

/** Stable salted per-row selection value in [0, 10000). */
function selectionBasisPoints(salt: string, blockId: string): number {
  const digest = createHash('sha256').update(`${SELECTION_DOMAIN}:${salt}:${blockId}`).digest();
  return digest.readUInt32BE(0) % BASIS_POINT_SCALE;
}

/**
 * Select the planted rows at a declared rate (percent, 0–100) by stable
 * SALTED hash: a row is planted iff its hash-derived basis points fall
 * under the rate. Deterministic for identical inputs, order-preserving, and
 * monotone in the rate (raising the rate only ADDS plants). The dispatcher
 * salt sits inside the hash domain so the selection cannot be recomputed
 * from the public stream plus a known rate (M5) — the salt is sealed with
 * the key set.
 */
export function selectPlantedBlockIds(
  blockIds: readonly string[],
  ratePercent: number,
  salt: string,
): readonly string[] {
  const thresholdBasisPoints = Math.round(ratePercent * 100);
  return blockIds.filter((blockId) => selectionBasisPoints(salt, blockId) < thresholdBasisPoints);
}

/**
 * Deterministically pick the donor row whose frozen span the planted
 * variant is re-pointed at: a salted-hash choice among the rows whose
 * re-pointed binding actually DIFFERS from the row's true binding (a
 * "wrong" binding that equals the right one would be no plant at all).
 */
export function selectDonorRow(input: {
  readonly rows: readonly ChallengeLedgerRow[];
  readonly row: ChallengeLedgerRow;
  readonly salt: string;
}): Result<ChallengeLedgerRow, Error> {
  const candidates = input.rows.filter(
    (candidate) =>
      candidate.block_id !== input.row.block_id &&
      derivePlantedVariant(input.row, candidate).binding !== input.row.binding,
  );
  const digest = createHash('sha256')
    .update(`${SELECTION_DOMAIN}:donor:${input.salt}:${input.row.block_id}`)
    .digest();
  const donor = candidates[digest.readUInt32BE(0) % Math.max(candidates.length, 1)];
  if (donor === undefined) {
    return err(
      new Error(
        `no donor span qualifies for '${input.row.block_id}': every candidate re-point would ` +
          'reproduce the true binding — cannot derive a plausible-but-wrong variant',
      ),
    );
  }
  return ok(donor);
}

/**
 * The dispatcher-held key set: the planted row ids PLUS the sealed
 * selection salt, both under the pre-batch commitment, both outside the
 * challenge fleet's read scope.
 */
const challengeKeySetSchema = z.strictObject({
  version: z.literal(1),
  ratePercent: z.number().nonnegative().max(100),
  salt: nonEmptyString,
  plantedBlockIds: z.array(nonEmptyString),
});
export type ChallengeKeySet = z.infer<typeof challengeKeySetSchema>;

/** Parse an unknown value as a {@link ChallengeKeySet} at the read boundary. */
export const parseChallengeKeySet = (value: unknown): Result<ChallengeKeySet, Error> =>
  parseWithSchema({ label: 'challenge key set', schema: challengeKeySetSchema, value });

/** Build the key set: version, declared rate, sealed salt, planted ids sorted. */
export function buildChallengeKeySet(input: {
  readonly ratePercent: number;
  readonly salt: string;
  readonly plantedBlockIds: readonly string[];
}): ChallengeKeySet {
  return {
    version: 1,
    ratePercent: input.ratePercent,
    salt: input.salt,
    plantedBlockIds: [...input.plantedBlockIds].sort(compareByCodeUnit),
  };
}

/** The seal: sha256 of the canonical key-set bytes, committed pre-batch. */
const challengeCommitmentSchema = z.strictObject({
  version: z.literal(1),
  keySetSha256: sha256HexSchema,
});
export type ChallengeCommitment = z.infer<typeof challengeCommitmentSchema>;

/** Parse an unknown value as a {@link ChallengeCommitment} at the read boundary. */
export const parseChallengeCommitment = (value: unknown): Result<ChallengeCommitment, Error> =>
  parseWithSchema({ label: 'challenge commitment', schema: challengeCommitmentSchema, value });

/** Build the commitment over the key-set file's exact bytes. */
export function buildChallengeCommitment(keySetBytes: Uint8Array): ChallengeCommitment {
  return { version: 1, keySetSha256: sha256Hex(keySetBytes) };
}

/** Challenge findings: the block ids a challenger reported as lossy. */
const challengeFindingsSchema = z.strictObject({
  version: z.literal(1),
  lossBlockIds: z.array(nonEmptyString),
});
export type ChallengeFindings = z.infer<typeof challengeFindingsSchema>;

/** Parse an unknown value as {@link ChallengeFindings} at the read boundary. */
export const parseChallengeFindings = (value: unknown): Result<ChallengeFindings, Error> =>
  parseWithSchema({ label: 'challenge findings', schema: challengeFindingsSchema, value });

/** The scored verdict: pass iff EVERY planted loss was caught. */
export interface ChallengeScore {
  readonly pass: boolean;
  readonly caught: readonly string[];
  readonly missed: readonly string[];
  readonly unplantedFindings: readonly string[];
}

/**
 * Score revealed keys against findings. `unplantedFindings` (findings on
 * unplanted rows) never affect the pass — they are REAL loss candidates
 * routed to adjudication, which is the challenge doing its other job.
 */
export function scoreChallenge(input: {
  readonly plantedBlockIds: readonly string[];
  readonly findingBlockIds: readonly string[];
}): ChallengeScore {
  const planted = new Set(input.plantedBlockIds);
  const findings = new Set(input.findingBlockIds);
  const caught = [...planted].filter((id) => findings.has(id)).sort(compareByCodeUnit);
  const missed = [...planted].filter((id) => !findings.has(id)).sort(compareByCodeUnit);
  const unplantedFindings = [...findings].filter((id) => !planted.has(id)).sort(compareByCodeUnit);
  return { pass: missed.length === 0, caught, missed, unplantedFindings };
}
