/**
 * The shared process boundary for the content generators (`generate-course.ts`,
 * `generate-quality-standards.ts`). The generators' cores are pure `Result`-returning functions;
 * this module is the single place errors become process output — an `err` is reported on stderr
 * and the process exits non-zero, so a failed generation can never write partial content.
 *
 * Emission is prettier-stable by construction: the produced JSON is formatted with the repo's
 * resolved prettier config before writing or `--check` comparison, so a fresh generation always
 * passes `format-check` and `--check` freshness stays a byte comparison.
 */

import { readFileSync, writeFileSync } from 'node:fs';

import { err, isErr, ok, type Result } from '@oaknational/result';
import { format, resolveConfig } from 'prettier';
import type { z } from 'zod';

/** Render one zod issue as `path: message (received …)` fail-loud diagnostics. */
const formatIssue = (issue: z.core.$ZodIssue): string => {
  const path = issue.path.map(String).join('.') || '(root)';
  const received = 'input' in issue ? ` (received ${JSON.stringify(issue.input)})` : '';
  return `  - ${path}: ${issue.message}${received}`;
};

/** Render a zod validation failure as a fail-loud multi-line diagnostic under `label`. */
export function formatValidationError(label: string, error: z.ZodError<unknown>): string {
  return `${label}:\n${error.issues.map(formatIssue).join('\n')}`;
}

/** Read a text file as a `Result` (the wrap for the one library boundary that throws). */
export function readTextFile(path: string): Result<string, string> {
  try {
    return ok(readFileSync(path, 'utf8'));
  } catch (error) {
    return err(
      `cannot read ${path}: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
    );
  }
}

/** Parse JSON text as a `Result` (the wrap for `JSON.parse`, which throws). */
export function parseJsonText(text: string): Result<unknown, string> {
  try {
    const value: unknown = JSON.parse(text);
    return ok(value);
  } catch (error) {
    return err(`invalid JSON: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
  }
}

/** Format emitted JSON with the repo's resolved prettier config (prettier-stable emission). */
async function formatEmittedJson(json: string, filepath: string): Promise<string> {
  const config = await resolveConfig(filepath);
  return format(json, { ...config, filepath });
}

/**
 * Run one generator to completion: produce → prettier-format → write (or `--check` compare).
 * This is the process boundary: every `err` from the pure core is reported on stderr and the
 * process exit code set non-zero; nothing in the generators throws.
 */
export async function runGeneratorCli(options: {
  readonly label: string;
  readonly outputPath: string;
  readonly produce: () => Result<string, string>;
}): Promise<void> {
  const { label, outputPath, produce } = options;
  const produced = produce();
  if (isErr(produced)) {
    process.stderr.write(`${label}: ${produced.error}\n`);
    process.exitCode = 1;
    return;
  }
  const formatted = await formatEmittedJson(produced.value, outputPath);
  if (process.argv.includes('--check')) {
    const current = readTextFile(outputPath);
    if (isErr(current) || current.value !== formatted) {
      process.stderr.write(
        `${label} --check: ${outputPath} is stale; re-run the generator (pnpm tsx)\n`,
      );
      process.exitCode = 1;
      return;
    }
    process.stdout.write(`${label} --check: up to date\n`);
    return;
  }
  writeFileSync(outputPath, formatted);
  process.stdout.write(`${label}: wrote ${outputPath}\n`);
}
