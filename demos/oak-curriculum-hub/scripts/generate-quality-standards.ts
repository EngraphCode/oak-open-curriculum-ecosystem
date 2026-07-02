/**
 * Re-runnable Oak quality-standards generator — the QS-content arm of the canonical-export sync
 * mechanism. Validates the vendored snapshot (`lib/data/quality-standards.json`, 685 rows) against
 * the quality-standard schema (`lib/quality-standards-types.ts`, the single source of truth) and
 * re-emits it as normalised, prettier-stable JSON in place.
 *
 * Content is DATA, not code: the schema validates every row's closed `type`/`state` sets BEFORE
 * the JSON is (re-)written (the generation-time belt), and `lib/data/load-quality-standards.ts`
 * re-validates the committed JSON at module initialisation (the runtime belt) — a drifted vendored
 * value fails the generate run or the build loud, never the runtime filter UI.
 *
 * Build tooling: lives in `scripts/` (never bundled by Next). Usage:
 * `pnpm tsx scripts/generate-quality-standards.ts`; `--check` verifies the committed JSON is
 * schema-valid and normalised.
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { err, flatMap, isErr, ok, type Result } from '@oaknational/result';

import { qualityStandardsSchema } from '../lib/quality-standards-types';
import {
  formatValidationError,
  parseJsonText,
  readTextFile,
  runGeneratorCli,
} from './generator-cli';

const SNAPSHOT_JSON = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../lib/data/quality-standards.json',
);

/**
 * Validate the snapshot text against the schema and produce the normalised JSON document — the
 * pure core the IO shell and the `--check` freshness guard build on. A drifted value is an `err`
 * carrying fail-loud diagnostics (path + message + received value); nothing throws.
 */
export function normaliseSnapshot(text: string): Result<string, string> {
  const raw = parseJsonText(text);
  if (isErr(raw)) {
    return raw;
  }
  const standards = qualityStandardsSchema.safeParse(raw.value, { reportInput: true });
  if (!standards.success) {
    return err(
      formatValidationError('vendored snapshot failed schema validation', standards.error),
    );
  }
  return ok(`${JSON.stringify(standards.data, null, 2)}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await runGeneratorCli({
    label: 'quality-standards generate',
    outputPath: SNAPSHOT_JSON,
    produce: () => flatMap(readTextFile(SNAPSHOT_JSON), normaliseSnapshot),
  });
}
