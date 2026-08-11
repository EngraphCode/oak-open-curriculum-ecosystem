/**
 * Leg (b) of the workspace-config-isolation validator: every positive
 * `$TURBO_ROOT$` input in turbo.json must match at least one tracked
 * file under the pinned matcher.
 *
 * @remarks turbo silently hashes zero files for an input that matches
 * nothing (measured: five stale entries contributed nothing, with no
 * warning), so cache invalidation rots invisibly. Two facts pin this
 * leg's contract, both measured with the repo's own turbo via
 * `--dry=json` resolved inputs (MCP-542, 2026-08-11 — the dry run is
 * the authoritative instrument, never a docs statement):
 *
 * - `**` matches ZERO or more path segments, and dot-directories match
 *   (`research/web-app-deconstruction/**\/*.yaml` hashes
 *   `pnpm-workspace.yaml` directly under the prefix; `**\/*.yml`
 *   hashes `.github/workflows/research.yml`).
 * - turbo's `inputs` globs walk the FILESYSTEM, not the git index
 *   (untracked and gitignored files hash — that is what the `!`
 *   negations in turbo.json do their work against).
 *
 * The predicate here deliberately checks the TRACKED file set
 * (`git ls-files`), not the filesystem: tracked-set membership is
 * deterministic across checkouts and build states, where an fs walk
 * would flip with build output present or absent. The over-
 * approximation is one-directional and named in the finding message:
 * an inputs entry whose only matches are untracked is itself a
 * cache-key determinism defect under this estate's doctrine (a cache
 * input that varies with build state), so the finding is correct to
 * fire on it. Negated entries are exempt (turbo applies them as
 * filters; they legitimately match generated content). Pattern syntax
 * outside the supported subset (`**`, `*`, `?`) is a REFUSAL, never a
 * guess — extend the matcher's supported subset with a red-proof
 * rather than working around the gate. Only `inputs` arrays are
 * scanned; `outputs` globs legitimately match nothing before a build.
 * turbo.json is JSONC, so the scan uses the `jsonc-parser` visitor.
 *
 * @packageDocumentation
 */

import { visit } from 'jsonc-parser';

import { lineOf } from './text-position.js';
import { GLOB_CANDIDATE, compileTurboGlob, isTrackedDirectoryPrefix } from './turbo-glob.js';

/** One `$TURBO_ROOT$` input entry that matches zero tracked files. */
interface TurboInputFinding {
  readonly entry: string;
  readonly line: number;
}

/** One JSONC parse error the fault-tolerant visitor would otherwise swallow. */
interface TurboParseError {
  readonly code: number;
  readonly line: number;
}

/** One entry whose pattern syntax sits outside the supported turbo subset. */
interface TurboInputRefusal {
  readonly entry: string;
  readonly line: number;
  readonly reason: string;
}

/** The scan's three outcome streams: findings, refusals, and parse errors. */
export interface TurboInputScan {
  readonly findings: readonly TurboInputFinding[];
  readonly parseErrors: readonly TurboParseError[];
  readonly refusals: readonly TurboInputRefusal[];
}

/** The per-entry verdict of the pinned matcher — a closed union. */
export type TurboEntryVerdict =
  | { readonly kind: 'alive' }
  | { readonly kind: 'dead' }
  | { readonly kind: 'exempt' }
  | { readonly kind: 'unsupported'; readonly reason: string };

const TURBO_ROOT_PREFIX = '$TURBO_ROOT$/';

/**
 * Classify one `$TURBO_ROOT$` input entry against the tracked file set.
 *
 * @remarks The single decision point both the scan and its tests
 * exercise. Negations are exempt BEFORE any syntax inspection (a
 * negation carrying unsupported syntax must not refuse the gate — the
 * leg never evaluates negations). A `$TURBO_ROOT$` occurrence not in
 * leading `$TURBO_ROOT$/` prefix form is unanalysable.
 */
/** Structural checks on the entry's macro form, ahead of any matching. */
function macroFormVerdict(entry: string): TurboEntryVerdict | undefined {
  if (entry.startsWith('!')) {
    return { kind: 'exempt' };
  }
  if (!entry.startsWith(TURBO_ROOT_PREFIX)) {
    return {
      kind: 'unsupported',
      reason: `$TURBO_ROOT$ occurrence outside leading '${TURBO_ROOT_PREFIX}' prefix form`,
    };
  }
  if (entry.slice(TURBO_ROOT_PREFIX.length).includes('$TURBO_ROOT$')) {
    // A repeated macro would otherwise fall through to the literal arm and
    // read as a dead FINDING; it is malformed input the leg cannot
    // evaluate, so it refuses (Copilot round 2 suppressed comment,
    // 2026-08-11 — harvested per the suppressed-comments discipline).
    return {
      kind: 'unsupported',
      reason: `repeated $TURBO_ROOT$ occurrence — the macro is valid only as the single leading prefix`,
    };
  }
  return undefined;
}

export function classifyTurboRootInput(
  entry: string,
  trackedFiles: readonly string[],
): TurboEntryVerdict {
  const formVerdict = macroFormVerdict(entry);
  if (formVerdict !== undefined) {
    return formVerdict;
  }
  const relative = entry.slice(TURBO_ROOT_PREFIX.length);
  if (!GLOB_CANDIDATE.test(relative)) {
    return trackedFiles.includes(relative) || isTrackedDirectoryPrefix(relative, trackedFiles)
      ? { kind: 'alive' }
      : { kind: 'dead' };
  }
  const compiled = compileTurboGlob(relative);
  if (compiled.kind === 'unsupported') {
    return compiled;
  }
  return trackedFiles.some((candidate) => compiled.regex.test(candidate))
    ? { kind: 'alive' }
    : { kind: 'dead' };
}

/**
 * Scan turbo.json (JSONC) for `$TURBO_ROOT$` entries inside `inputs`
 * arrays, reporting dead entries and refusals with their lines.
 *
 * @remarks `jsonc-parser`'s visitor is fault-tolerant: without an
 * `onError` handler it silently accepts malformed JSONC and visits only
 * the recoverable fragments, so a truncated turbo.json could scan as
 * clean. Parse errors are therefore first-class output — the bin
 * refuses (exit 2) on any, per the validator's fail-loud contract.
 */
/** Route one entry's verdict into the scan's finding/refusal streams. */
function recordEntryVerdict(input: {
  readonly value: string;
  readonly line: number;
  readonly trackedFiles: readonly string[];
  readonly findings: TurboInputFinding[];
  readonly refusals: TurboInputRefusal[];
}): void {
  const { value, line, trackedFiles, findings, refusals } = input;
  const verdict = classifyTurboRootInput(value, trackedFiles);
  if (verdict.kind === 'dead') {
    findings.push({ entry: value, line });
  } else if (verdict.kind === 'unsupported') {
    refusals.push({ entry: value, line, reason: verdict.reason });
  }
}

export function scanTurboRootInputs(input: {
  readonly turboJsonText: string;
  readonly trackedFiles: readonly string[];
}): TurboInputScan {
  const { turboJsonText, trackedFiles } = input;
  const findings: TurboInputFinding[] = [];
  const parseErrors: TurboParseError[] = [];
  const refusals: TurboInputRefusal[] = [];
  let currentProperty = '';
  let inInputs = false;
  let arrayDepth = 0;

  visit(turboJsonText, {
    onObjectProperty(property) {
      currentProperty = property;
    },
    onArrayBegin() {
      if (arrayDepth === 0 && currentProperty === 'inputs') {
        inInputs = true;
      }
      if (inInputs) {
        arrayDepth += 1;
      }
    },
    onArrayEnd() {
      if (inInputs) {
        arrayDepth -= 1;
        if (arrayDepth === 0) {
          inInputs = false;
        }
      }
    },
    onLiteralValue(value, offset) {
      if (inInputs && typeof value === 'string' && value.includes('$TURBO_ROOT$')) {
        recordEntryVerdict({
          value,
          line: lineOf(turboJsonText, offset),
          trackedFiles,
          findings,
          refusals,
        });
      }
    },
    onError(code, offset) {
      parseErrors.push({ code, line: lineOf(turboJsonText, offset) });
    },
  });

  return { findings, parseErrors, refusals };
}
