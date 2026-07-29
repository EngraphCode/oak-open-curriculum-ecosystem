/**
 * Gating validator for the owner's no-hardcoded-values invariant, CSS half
 * (wired into the root `repo-validators:check` chain; the TSX half is the
 * eslint style-attribute ban). Walks every authored .css file in the
 * workspace and fails on any literal design value (tools/css-literal-values
 * is the pure classifier).
 *
 * Named exclusions, never silent ones: public/ holds kit-authored copies —
 * definitions, not authored consumption, owned by validate-kit-assets;
 * build output and dependencies are not authored surfaces. A walk that
 * finds ZERO files fails: an instrument scanning nothing reads as green
 * while proving nothing.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { findLiteralDesignValues } from './css-literal-values';

const workspaceRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.next',
  '.turbo',
  'public',
  'test-results',
  'playwright-report',
]);

function authoredCssFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) {
        files.push(...authoredCssFiles(join(dir, entry.name)));
      }
    } else if (entry.name.endsWith('.css')) {
      files.push(join(dir, entry.name));
    }
  }
  return files;
}

const cssFiles = authoredCssFiles(workspaceRoot);
const failures: string[] = [];

if (cssFiles.length === 0) {
  failures.push('scanned zero authored .css files — the walk is broken, not the CSS clean');
}

for (const file of cssFiles) {
  for (const finding of findLiteralDesignValues(readFileSync(file, 'utf8'))) {
    failures.push(
      `${relative(workspaceRoot, file)}: ${finding.selector} { ${finding.prop}: ${finding.value} } — every design value must come from the kit (var(--…) roles/scales)`,
    );
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    process.stderr.write(`validate-authored-css: ${failure}\n`);
  }
  process.exitCode = 1;
} else {
  process.stdout.write(
    `validate-authored-css: ${String(cssFiles.length)} authored file(s) clean — zero literal design values\n`,
  );
}
