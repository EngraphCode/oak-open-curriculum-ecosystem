/**
 * Pure decision logic for the agent-tools install bootstrap.
 *
 * The runtime that resolves `tsc`, spawns it, and sets executable bits lives in
 * `bootstrap.ts`; this module isolates the part that must never get the
 * fail-open semantics wrong, so it can be unit-tested in isolation.
 *
 * @packageDocumentation
 */
import path from 'node:path';

import { z } from 'zod';

/** The relevant fields of a `child_process.spawnSync` result for the tsc run. */
export interface TscSpawnOutcome {
  /** A spawn-level error (e.g. the binary could not be started). */
  readonly error: Error | undefined;
  /** The signal that terminated the process, or `null` if it exited normally. */
  readonly signal: NodeJS.Signals | null;
  /** The exit code, or `null` when the process was killed by a signal. */
  readonly status: number | null;
}

/** The verdict on whether the tsc build succeeded and the code to exit with. */
export interface TscOutcomeVerdict {
  /** True when the build did not complete cleanly. */
  readonly failed: boolean;
  /** The process exit code to use. Never `0` when `failed` is true. */
  readonly exitCode: number;
  /** A human-readable failure reason, or `undefined` on success. */
  readonly reason: string | undefined;
}

/**
 * Interpret a spawnSync outcome into a pass/fail verdict with a safe exit code.
 *
 * Critically, a signal kill returns `status === null`; this must map to a
 * non-zero exit code. Coercing a `null` status to `process.exit(null)` would
 * exit `0`, leaving `dist` unbuilt and the fail-open PreToolUse guards without
 * their artefact.
 *
 * @param label - The human-readable name of the spawned tool, used in reasons.
 * @param outcome - The spawnSync error/signal/status triple.
 * @returns The verdict; `exitCode` is always non-zero when `failed` is true.
 *
 * @example
 *
 * ```ts
 * interpretSpawnOutcome('tsup', { error: undefined, signal: 'SIGKILL', status: null });
 * // { failed: true, exitCode: 1, reason: 'tsup was killed by signal SIGKILL' }
 * ```
 */
export function interpretSpawnOutcome(label: string, outcome: TscSpawnOutcome): TscOutcomeVerdict {
  if (outcome.error !== undefined) {
    return {
      failed: true,
      exitCode: 1,
      reason: `failed to start ${label}: ${outcome.error.message}`,
    };
  }
  if (outcome.signal !== null) {
    return {
      failed: true,
      exitCode: outcome.status ?? 1,
      reason: `${label} was killed by signal ${outcome.signal}`,
    };
  }
  if (outcome.status !== 0) {
    return {
      failed: true,
      exitCode: outcome.status ?? 1,
      reason: `${label} exited with code ${outcome.status ?? 'null'}`,
    };
  }
  return { failed: false, exitCode: 0, reason: undefined };
}

/**
 * Interpret the agent-tools `tsc` build outcome.
 *
 * @param outcome - The spawnSync error/signal/status triple.
 * @returns The verdict from {@link interpretSpawnOutcome} with the `tsc` label.
 */
export function interpretTscOutcome(outcome: TscSpawnOutcome): TscOutcomeVerdict {
  return interpretSpawnOutcome('tsc', outcome);
}

/** The manifest fields this bootstrap consumes — the validated boundary shape. */
const binManifestSchema = z.object({
  bin: z.union([z.string(), z.record(z.string(), z.string())]).optional(),
});

/**
 * Resolve a package's JS bin entry from its parsed, untrusted manifest.
 *
 * Handles both manifest shapes (`"bin": "./x.js"` and
 * `"bin": { "name": "./x.js" }`) by validating the manifest at the boundary:
 * any shape that does not yield a non-empty string for the requested bin name
 * returns `undefined` so the caller can fail loudly with context.
 *
 * @param packageDir - Absolute directory containing the package's manifest.
 * @param manifest - The parsed manifest JSON, untrusted.
 * @param binName - The bin entry to resolve (the package's command name).
 * @returns The absolute path to the JS bin, or `undefined` if unresolvable.
 */
export function binPathFromManifest(
  packageDir: string,
  manifest: unknown,
  binName: string,
): string | undefined {
  const parsed = binManifestSchema.safeParse(manifest);
  if (!parsed.success) {
    return undefined;
  }
  const manifestBin = parsed.data.bin;
  if (typeof manifestBin === 'string' && manifestBin.length > 0) {
    return path.join(packageDir, manifestBin);
  }
  if (typeof manifestBin === 'object' && manifestBin !== undefined) {
    const entry = manifestBin[binName];
    if (typeof entry === 'string' && entry.length > 0) {
      return path.join(packageDir, entry);
    }
  }
  return undefined;
}
