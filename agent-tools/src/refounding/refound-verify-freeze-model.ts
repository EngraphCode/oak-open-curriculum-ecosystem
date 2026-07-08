import { err, ok, type Result } from '@oaknational/result';

import {
  compareByCodeUnit,
  type Denominator,
  type DenominatorFile,
  type FreezeIdentityEntry,
} from './refounding-artefacts.js';
import { type DenominatorAmendment, type NumberedAmendment } from './refound-amendments.js';

/**
 * The freeze verifier's data model: the effective-denominator merge and the
 * violation vocabulary its RED findings are expressed in. Pure — the
 * filesystem-facing verification lives in
 * `refound-verify-freeze-helpers.ts`.
 *
 * @packageDocumentation
 */

/**
 * Check one amendment file row against its identity-proof entry: the proof
 * must exist, prove `source == copy` (byte identity at routing time), and
 * agree with the row's hash and byte count. Any failure is a refusal —
 * F1 §7: downstream arithmetic refuses to run if any amendment lacks its
 * identity proof.
 */
function checkAmendmentRow(input: {
  readonly label: string;
  readonly file: DenominatorFile;
  readonly proof: FreezeIdentityEntry | undefined;
}): Result<void, Error> {
  const { label, file, proof } = input;
  if (proof === undefined) {
    return err(new Error(`${label} lacks an identity proof for '${file.path}' — refusing (F1 §7)`));
  }
  if (proof.source_sha256 !== proof.copy_sha256) {
    return err(
      new Error(
        `${label} identity proof for '${file.path}' shows source != copy — the routed bytes ` +
          'were never proven identical; refusing',
      ),
    );
  }
  if (proof.copy_sha256 !== file.sha256 || proof.bytes !== file.bytes) {
    return err(
      new Error(
        `${label} identity proof for '${file.path}' disagrees with its denominator row ` +
          '(hash or byte count) — refusing',
      ),
    );
  }
  return ok(undefined);
}

/**
 * Refuse an amendment that lists one path twice — in its identity-proof set,
 * or (the case previously mis-reported as a missing proof) its file list.
 * Both are within-amendment collisions, refused before any row is folded in.
 */
function checkAmendmentDuplicates(
  label: string,
  amendment: DenominatorAmendment,
): Result<void, Error> {
  const proofPaths = amendment.identityProof.map((entry) => entry.path);
  if (new Set(proofPaths).size !== proofPaths.length) {
    return err(new Error(`${label} carries duplicate identity-proof paths — refusing`));
  }
  const filePaths = amendment.files.map((file) => file.path);
  if (new Set(filePaths).size === filePaths.length) {
    return ok(undefined);
  }
  const colliding = [...new Set(filePaths.filter((p, i) => filePaths.indexOf(p) !== i))].sort(
    compareByCodeUnit,
  );
  return err(
    new Error(
      `${label} lists a file path more than once within one amendment — a within-amendment path ` +
        `collision: ${colliding.join(', ')} (each frozen path appends exactly one row); refusing`,
    ),
  );
}

/** Fold one amendment's rows into the merged path set, refusing collisions. */
function mergeOneAmendment(input: {
  readonly numbered: NumberedAmendment;
  readonly mergedFiles: DenominatorFile[];
  readonly knownPaths: Set<string>;
}): Result<void, Error> {
  const { sequence, amendment } = input.numbered;
  const label = `amendment-${String(sequence)}`;
  const duplicates = checkAmendmentDuplicates(label, amendment);
  if (!duplicates.ok) {
    return duplicates;
  }
  const proofByPath = new Map(amendment.identityProof.map((entry) => [entry.path, entry]));
  for (const file of amendment.files) {
    const rowVerdict = checkAmendmentRow({ label, file, proof: proofByPath.get(file.path) });
    if (!rowVerdict.ok) {
      return rowVerdict;
    }
    if (input.knownPaths.has(file.path)) {
      return err(
        new Error(
          `${label} names '${file.path}', which the effective denominator already contains — ` +
            'a modified arrival takes a versioned frozen-v2 copy, never a same-path re-freeze',
        ),
      );
    }
    proofByPath.delete(file.path);
    input.knownPaths.add(file.path);
    input.mergedFiles.push(file);
  }
  if (proofByPath.size > 0) {
    const strays = [...proofByPath.keys()].sort(compareByCodeUnit);
    return err(
      new Error(
        `${label} carries identity proofs for paths outside its file list: ${strays.join(', ')}`,
      ),
    );
  }
  return ok(undefined);
}

/**
 * Merge the v1 denominator with its amendments into the effective
 * denominator every downstream check divides by (`v1 + all amendments`,
 * F1 §7).
 *
 * @remarks
 * The merge refuses — a typed `Err`, nothing merged — when any amendment
 * file row lacks its identity proof, when a proof disagrees with its row or
 * shows `source != copy`, when a proof cites a path outside the file list,
 * or when an amendment path collides with the denominator or an earlier
 * amendment. The merged file list is re-sorted by path (UTF-16 code-unit
 * order) and totals are recomputed in code — the determinism contract of the
 * v1 artefact carries over to the effective denominator.
 */
export function mergeDenominator(
  v1: Denominator,
  amendments: readonly NumberedAmendment[],
): Result<Denominator, Error> {
  if (amendments.length === 0) {
    return ok(v1);
  }
  const mergedFiles: DenominatorFile[] = [...v1.files];
  const knownPaths = new Set(v1.files.map((file) => file.path));
  for (const numbered of amendments) {
    const verdict = mergeOneAmendment({ numbered, mergedFiles, knownPaths });
    if (!verdict.ok) {
      return verdict;
    }
  }
  mergedFiles.sort((a, b) => compareByCodeUnit(a.path, b.path));
  let lines = 0;
  let bytes = 0;
  for (const file of mergedFiles) {
    lines += file.lines;
    bytes += file.bytes;
  }
  return ok({
    version: v1.version,
    generatedFrom: v1.generatedFrom,
    files: mergedFiles,
    totals: { files: mergedFiles.length, lines, bytes },
  });
}

/** One RED finding from the verifier, as a typed value. */
export type FreezeViolation =
  | {
      readonly kind: 'hash-mismatch';
      readonly path: string;
      readonly expectedSha256: string;
      readonly actualSha256: string;
    }
  | { readonly kind: 'missing'; readonly path: string }
  | { readonly kind: 'unreadable'; readonly path: string; readonly detail: string }
  | { readonly kind: 'extra'; readonly path: string }
  | { readonly kind: 'recount-mismatch'; readonly path: string; readonly detail: string }
  | { readonly kind: 'totals-mismatch'; readonly detail: string };

/** Render one violation as an operator-readable line. */
export function formatViolation(violation: FreezeViolation): string {
  if (violation.kind === 'hash-mismatch') {
    return (
      `hash mismatch at ${violation.path}: denominator ${violation.expectedSha256}, ` +
      `frozen copy ${violation.actualSha256}`
    );
  }
  if (violation.kind === 'missing') {
    return `missing frozen file: ${violation.path}`;
  }
  if (violation.kind === 'unreadable') {
    return `unreadable frozen file ${violation.path}: ${violation.detail}`;
  }
  if (violation.kind === 'extra') {
    return `extra file under the frozen tree, absent from the denominator: ${violation.path}`;
  }
  if (violation.kind === 'recount-mismatch') {
    return `denominator row recount mismatch at ${violation.path}: ${violation.detail}`;
  }
  return `denominator totals disagree with its file list: ${violation.detail}`;
}
