/**
 * Generates the committed explain effort-orientation constant (WS-B).
 *
 * Composes the body via the pure `transformExplainContent` (the curated behaviour shell
 * plus the curated effort-overview, injected here) and writes `src/generated/explain-content.ts`
 * exporting the body and its `lastModified`. Runtime imports only the committed constant, so
 * the published surface never reads the filesystem (ADR-041).
 *
 * The curated constants are faithful, effort-domain projections of their sources
 * (the explain `SKILL-CANONICAL.md`; `README.md` / `VISION.md`), kept correct by authoring
 * and review — not by an automated content or source-fingerprint check. Freshness of the
 * committed artefact is guarded the standard codegen way: the `check:explain-content` task
 * regenerates and runs `git diff --exit-code`, so a stale committed body fails the gate.
 *
 * `lastModified` is the NEWEST source-file commit date (git `%cI`), never build or
 * wall-clock time. Re-generate: `pnpm generate:explain-content`.
 * Note: `%cI` is the COMMITTER date, so rebasing/amending any commit that touches the source
 * files (SKILL-CANONICAL.md / README.md / VISION.md) rewrites it and moves `lastModified` even
 * with no content change — the drift check will then flag the committed body stale until you
 * `pnpm generate:explain-content` and re-stage it. Expected, not a bug.
 *
 * @see src/explain/explain-content-transform.ts — the pure assembler
 * @see scripts/embed-widget-html.ts — the sibling generation-step pattern
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { transformExplainContent } from '../src/explain/explain-content-transform.js';
import { EXPLAIN_BEHAVIOUR_SHELL } from '../src/explain/behaviour-shell.js';
import { EXPLAIN_EFFORT_OVERVIEW } from '../src/explain/effort-overview.js';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDir, '..');
const repoRoot = resolve(appRoot, '../..');

/** Source files whose newest commit date sets the body's `lastModified` freshness signal. */
const sourcePaths = [
  resolve(repoRoot, '.agent/skills/explain/SKILL-CANONICAL.md'),
  resolve(repoRoot, 'README.md'),
  resolve(repoRoot, 'VISION.md'),
];
const outputPath = resolve(appRoot, 'src/generated/explain-content.ts');

/** Newest commit date (ISO-8601) across the source files, via git `%cI`. */
function newestSourceCommitDate(paths: readonly string[]): string {
  let newest = '';
  for (const path of paths) {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', path], {
      cwd: repoRoot,
      encoding: 'utf-8',
    }).trim();
    if (out === '') {
      process.stderr.write(`No git commit found for source file: ${path}\n`);
      process.exit(1);
    }
    if (out.localeCompare(newest) > 0) {
      newest = out;
    }
  }
  return newest;
}

const lastModified = newestSourceCommitDate(sourcePaths);

const body = transformExplainContent({
  behaviourShell: EXPLAIN_BEHAVIOUR_SHELL,
  effortOverview: EXPLAIN_EFFORT_OVERVIEW,
  lastModified,
});

const escaped = body.replaceAll('\\', '\\\\').replaceAll('`', '\\`').replaceAll('${', '\\${');

mkdirSync(dirname(outputPath), { recursive: true });

const output = `/**
 * GENERATED FILE — DO NOT EDIT
 *
 * Explain effort-orientation body: the curated behaviour shell plus the curated
 * effort-overview, composed with a source-commit-date freshness signal.
 * Re-generate: pnpm generate:explain-content
 *
 * @see scripts/generate-explain-content.ts - generation step
 */
export const EXPLAIN_ORIENTATION_BODY = \`${escaped}\` as const;

export const EXPLAIN_LAST_MODIFIED = '${lastModified}' as const;
`;

writeFileSync(outputPath, output, 'utf-8');

const sizeKb = (Buffer.byteLength(body, 'utf-8') / 1024).toFixed(1);
process.stdout.write(
  `Generated explain content (${sizeKb} KB, lastModified ${lastModified}) → src/generated/explain-content.ts\n`,
);
