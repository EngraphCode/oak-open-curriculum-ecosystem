/**
 * Output contract for emitted harness workflow artefacts.
 *
 * @remarks
 * The harness Workflow sandbox has hard rules the repo cannot import-check or
 * `node --check` (the artefact's top-level `return` is only legal inside the harness's
 * AsyncFunction wrap). These checks are the machine enforcement of every rule on every
 * build — shape, determinism, self-containment, purity, size, syntax — so a violation
 * fails `pnpm build`, never a launch checklist. Each check returns a `Result`; the
 * build composition root refuses to write an artefact on any `err`.
 *
 * @packageDocumentation
 */

import { err, ok, type Result } from '@oaknational/result';
import { transformSync } from 'esbuild';

/** The harness rejects workflow scripts longer than this (its `script` maxLength). */
const HARNESS_SCRIPT_MAX_CHARS = 524_288;

/** The injected sandbox globals the artefact may reference as free identifiers. */
const HARNESS_GLOBALS = ['agent', 'parallel', 'phase', 'log', 'args'] as const;

/**
 * Deterministic-execution ban: wall-clock and randomness break harness resume.
 * `Math.imul` (the FNV jitter hash) is pure arithmetic and explicitly allowed.
 */
const FORBIDDEN_TIME_SOURCES = [/\bDate\.now\s*\(/, /\bnew Date\s*\(/, /\bMath\.random\s*\(/];

/**
 * Module-system / Node-API usage — the artefact must be fully self-contained. Patterns
 * are word-boundary-precise so schema/prompt content (e.g. the `importance` property)
 * cannot false-positive; a statement-position `import` is what a real leak looks like.
 */
const MODULE_SYSTEM_PATTERNS = [
  /^\s*import[\s({"']/m,
  /\bimport\s*\(/,
  /\brequire\s*\(/,
  /["']node:/,
  /\bprocess\./,
];

/** Runtime schema libraries must never enter the sandbox bundle (derived at build). */
const PURITY_PATTERNS = [/\bz\./, /\bsafeParse\b/, /\bZod/, /@oaknational\/result/];

/** The artefact must open with the statically-parsed meta export. */
export function checkBeginsWithMetaExport(artefact: string): Result<undefined, Error> {
  if (!artefact.startsWith('export const meta = {')) {
    return err(
      new Error('Artefact must begin with `export const meta = {` as its first statement.'),
    );
  }
  return ok(undefined);
}

/** The artefact must end by returning the stage result to the harness. */
export function checkEndsWithHarnessReturn(artefact: string): Result<undefined, Error> {
  if (!artefact.trimEnd().endsWith('return await main();')) {
    return err(new Error('Artefact must end with the top-level `return await main();`.'));
  }
  return ok(undefined);
}

/** No wall-clock or randomness — they break harness resume determinism. */
export function checkNoForbiddenTimeSources(artefact: string): Result<undefined, Error> {
  for (const pattern of FORBIDDEN_TIME_SOURCES) {
    const match = artefact.match(pattern);
    if (match) {
      return err(new Error(`Artefact uses forbidden non-deterministic source: ${match[0]}`));
    }
  }
  return ok(undefined);
}

/** No imports, require, node: builtins, or process — the sandbox has none of them. */
export function checkNoModuleSystem(artefact: string): Result<undefined, Error> {
  for (const pattern of MODULE_SYSTEM_PATTERNS) {
    const match = artefact.match(pattern);
    if (match) {
      return err(
        new Error(`Artefact must be self-contained; found module-system / Node usage: ${match[0]}`),
      );
    }
  }
  return ok(undefined);
}

/** No zod / schema-library runtime in the sandbox — schemas are derived at build time. */
export function checkSandboxPurity(artefact: string): Result<undefined, Error> {
  for (const pattern of PURITY_PATTERNS) {
    const match = artefact.match(pattern);
    if (match) {
      return err(new Error(`Artefact violates sandbox purity; found: ${match[0]}`));
    }
  }
  return ok(undefined);
}

/** The harness rejects oversized scripts; fail at build time with both numbers. */
export function checkWithinHarnessSizeCap(artefact: string): Result<undefined, Error> {
  if (artefact.length > HARNESS_SCRIPT_MAX_CHARS) {
    return err(
      new Error(
        `Artefact is ${artefact.length} chars — over the harness cap of ${HARNESS_SCRIPT_MAX_CHARS}.`,
      ),
    );
  }
  return ok(undefined);
}

/**
 * Validate the artefact's syntax exactly the way the harness runs it: the body (minus
 * the meta export line) wrapped as an async function whose parameters are the sandbox
 * globals. Uses esbuild's parser — pure syntax validation, no code execution — and
 * catches what `node --check` cannot (it rejects the top-level `return` outright),
 * including a stage redeclaring an injected global.
 */
export function checkCompilesUnderHarness(artefact: string): Result<undefined, Error> {
  const body = artefact.replace(/^export const meta = \{[\s\S]*?\};\n/, '');
  const wrapped = `async function harnessBody(${HARNESS_GLOBALS.join(', ')}) {\n${body}\n}`;
  try {
    transformSync(wrapped, { loader: 'js' });
    return ok(undefined);
  } catch (cause) {
    return err(
      new Error(
        `Artefact body does not compile under the harness async wrap: ${cause instanceof Error ? cause.message : String(cause)}`,
        { cause },
      ),
    );
  }
}

/** Run the full output contract over one emitted artefact, aggregating every failure. */
export function checkHarnessArtefactContract(artefact: string): Result<undefined, Error> {
  const failures = [
    checkBeginsWithMetaExport(artefact),
    checkEndsWithHarnessReturn(artefact),
    checkNoForbiddenTimeSources(artefact),
    checkNoModuleSystem(artefact),
    checkSandboxPurity(artefact),
    checkWithinHarnessSizeCap(artefact),
    checkCompilesUnderHarness(artefact),
  ].flatMap((result) => (result.ok ? [] : [result.error.message]));
  if (failures.length > 0) {
    return err(
      new Error(`Artefact violates the harness output contract:\n- ${failures.join('\n- ')}`),
    );
  }
  return ok(undefined);
}
