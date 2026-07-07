/**
 * Re-runnable Oak Course generator — the Course-content arm of the canonical-export sync
 * mechanism. Extracts the course from the canonical export (`Oak Course.dc.html`, via
 * `./course-extract`), validates it against the course schema (`lib/course/schema.ts`, the single
 * source of truth), and emits the committed JSON data file (`lib/course/oak-course.json`).
 * Re-running it on a fresh export is how Course content stays in sync by construction.
 *
 * Content is DATA, not code: the schema validates every block BEFORE the JSON is written (the
 * generation-time belt), and `lib/course/load-course.ts` re-validates the committed JSON at module
 * initialisation (the runtime belt) — so the exhaustive `BlockRenderer` stays safe by construction
 * without a single generated line entering the lint/type corpus as source.
 *
 * Build tooling: lives in `scripts/` (never bundled by Next). Usage:
 * `pnpm tsx scripts/generate-course.ts`; `--check` verifies the committed JSON is up to date.
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { err, flatMap, isErr, ok, type Result } from '@oaknational/result';

import { courseSchema } from '../lib/course/schema';
import { extractCourse, extractScript } from './course-extract';
import { formatValidationError, readTextFile, runGeneratorCli } from './generator-cli';

const EXPORT_HTML = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../claude-design-canonical-export/Oak Course.dc.html',
);
const OUTPUT_JSON = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../lib/course/oak-course.json',
);

/**
 * Produce the course JSON document from the export HTML string — the pure core the IO shell and
 * the `--check` freshness guard build on. Extraction failures and schema violations are `err`s
 * carrying fail-loud diagnostics (path + message + received value); nothing throws.
 */
export function generateFromHtml(html: string): Result<string, string> {
  const raw = flatMap(extractScript(html), extractCourse);
  if (isErr(raw)) {
    return raw;
  }
  const course = courseSchema.safeParse(raw.value, { reportInput: true });
  if (!course.success) {
    return err(formatValidationError('extracted course failed schema validation', course.error));
  }
  return ok(`${JSON.stringify(course.data, null, 2)}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await runGeneratorCli({
    label: 'course generate',
    outputPath: OUTPUT_JSON,
    produce: () => flatMap(readTextFile(EXPORT_HTML), generateFromHtml),
  });
}
