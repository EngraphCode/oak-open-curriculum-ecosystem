/**
 * Generates the committed explain effort-orientation constant (WS-B, D1).
 *
 * Assembles the body via the pure `transformExplainContent` (curated behaviour shell
 * plus a stable effort-overview extracted from README.md / VISION.md), writes
 * `src/generated/explain-content.ts` exporting the body, its `lastModified`, and the
 * canonical-behaviour fingerprint of record. Runtime imports only the committed
 * constant, so the published surface never reads the filesystem (ADR-041).
 *
 * DRIFT-GUARD: this script reads the explain SKILL-CANONICAL purely to fingerprint
 * its behaviour-contract sections, and FAILS if that fingerprint diverges from the
 * pinned `EXPECTED_CANONICAL_BEHAVIOUR_FINGERPRINT`. The curated behaviour shell is
 * hand-authored, so this generation-time assertion is how single-sourcing stays a
 * TESTED relationship (PDR-112/ADR-202, Director-ratified 2026-06-24): a canonical
 * behaviour change can only land loudly, forcing a deliberate re-curation + re-pin.
 *
 * `lastModified` is the NEWEST source-file commit date (git `%cI`), never build or
 * wall-clock time. Re-generate: `pnpm generate:explain-content`; the `check:explain-content`
 * drift check (regenerate → `git diff --exit-code`) guards freshness in the gate (wired into
 * `pnpm check` via the turbo `check:explain-content` task).
 * Note: `%cI` is the COMMITTER date, so rebasing/amending any commit that touches the source
 * files (SKILL-CANONICAL.md / README.md / VISION.md) rewrites it and moves `lastModified` even
 * with no content change — the drift check will then flag the committed body stale until you
 * `pnpm generate:explain-content` and re-stage it. Expected, not a bug.
 *
 * @see src/explain/explain-content-transform.ts — the pure transformer
 * @see src/explain/canonical-behaviour-contract.ts — the drift-guard anchor
 * @see scripts/embed-widget-html.ts — the sibling generation-step pattern
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { transformExplainContent } from '../src/explain/explain-content-transform.js';
import {
  fingerprintCanonicalBehaviour,
  EXPECTED_CANONICAL_BEHAVIOUR_FINGERPRINT,
} from '../src/explain/canonical-behaviour-contract.js';
import {
  fingerprintEffortSource,
  EXPECTED_EFFORT_SOURCE_FINGERPRINT,
} from '../src/explain/effort-source-contract.js';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDir, '..');
const repoRoot = resolve(appRoot, '../..');

const sources = {
  canonical: resolve(repoRoot, '.agent/skills/explain/SKILL-CANONICAL.md'),
  readme: resolve(repoRoot, 'README.md'),
  vision: resolve(repoRoot, 'VISION.md'),
};
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

// Drift-guard: the canonical's behaviour contract must match what the curated shell
// was reviewed against, or generation fails loud.
const canonical = readFileSync(sources.canonical, 'utf-8');
const fingerprint = fingerprintCanonicalBehaviour(canonical);
if (fingerprint !== EXPECTED_CANONICAL_BEHAVIOUR_FINGERPRINT) {
  process.stderr.write(
    'DRIFT-GUARD FAILED: the explain canonical behaviour contract has changed.\n' +
      'Re-review the curated EXPLAIN_BEHAVIOUR_SHELL against the canonical, then re-pin\n' +
      'EXPECTED_CANONICAL_BEHAVIOUR_FINGERPRINT in canonical-behaviour-contract.ts.\n' +
      `  expected: ${EXPECTED_CANONICAL_BEHAVIOUR_FINGERPRINT}\n` +
      `  actual:   ${fingerprint}\n`,
  );
  process.exit(1);
}

// Effort-source drift-guard: the curated effort overview must match the README/VISION
// effort prose it was reviewed against, or generation fails loud (same tested-single-sourcing
// pattern as the canonical behaviour drift-guard above).
const readme = readFileSync(sources.readme, 'utf-8');
const vision = readFileSync(sources.vision, 'utf-8');
const effortFingerprint = fingerprintEffortSource(readme, vision);
if (effortFingerprint !== EXPECTED_EFFORT_SOURCE_FINGERPRINT) {
  process.stderr.write(
    'DRIFT-GUARD FAILED: the README/VISION effort source has changed.\n' +
      'Re-review the curated EXPLAIN_EFFORT_OVERVIEW against the source, then re-pin\n' +
      'EXPECTED_EFFORT_SOURCE_FINGERPRINT in effort-source-contract.ts.\n' +
      `  expected: ${EXPECTED_EFFORT_SOURCE_FINGERPRINT}\n` +
      `  actual:   ${effortFingerprint}\n`,
  );
  process.exit(1);
}

const lastModified = newestSourceCommitDate([sources.canonical, sources.readme, sources.vision]);

const body = transformExplainContent({ lastModified });

const escaped = body.replaceAll('\\', '\\\\').replaceAll('`', '\\`').replaceAll('${', '\\${');

mkdirSync(dirname(outputPath), { recursive: true });

const output = `/**
 * GENERATED FILE — DO NOT EDIT
 *
 * Explain effort-orientation body: the curated behaviour shell plus the curated
 * effort-overview, each anchored to its source by a generation-time drift-guard
 * (curriculum and volatility firewalls held by construction in the curated constants).
 * Re-generate: pnpm generate:explain-content
 *
 * @see scripts/generate-explain-content.ts - generation step (carries the drift-guards)
 */
export const EXPLAIN_ORIENTATION_BODY = \`${escaped}\` as const;

export const EXPLAIN_LAST_MODIFIED = '${lastModified}' as const;
`;

writeFileSync(outputPath, output, 'utf-8');

const sizeKb = (Buffer.byteLength(body, 'utf-8') / 1024).toFixed(1);
process.stdout.write(
  `Generated explain content (${sizeKb} KB, lastModified ${lastModified}) → src/generated/explain-content.ts\n`,
);
