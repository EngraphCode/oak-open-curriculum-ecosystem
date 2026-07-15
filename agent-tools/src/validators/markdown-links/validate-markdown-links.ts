#!/usr/bin/env node

import path from 'node:path';

import { glob } from 'tinyglobby';

import { resolveRepoRoot } from '../../core/repo-root.js';
import { readText } from '../portability/portability-fs.js';
import { writeLine } from '../../core/terminal-output.js';

import {
  findBrokenLinks,
  isExcludedPath,
  type MarkdownLinkReport,
  type ScanFile,
} from './validate-markdown-links-helpers.js';

/**
 * Markdown internal-link validator. Scans the repo's doc surfaces, extracts
 * internal `.md` links (inline `](target)` and reference-def `[label]: target`,
 * ignoring URLs, mailto, pure `#anchors`, and backticked concept-names), and
 * reports any whose resolved target file does not exist. For each broken link
 * whose only fault is relative-path depth — a unique non-archive file with the
 * same basename exists elsewhere — it emits the corrected relative path as a
 * `suggestedFix`. It does NOT modify any markdown; remediation is a separate
 * planned session.
 *
 * Broken links fail the gate. The validator became blocking after the
 * repository-wide broken-link backlog was repaired.
 *
 * Cross-file fragment validation (does a `#section` exist in the *target* file)
 * is a documented future enhancement and is out of scope here — markdownlint
 * already covers same-file fragments.
 *
 * @packageDocumentation
 */

const repoRoot = resolveRepoRoot(import.meta.url);

/** Glob patterns for every policed live Markdown source in the repository. */
const SCAN_GLOBS = ['**/*.md'] as const;

/** Globs excluded from the existence inventory because they cannot be portable targets. */
const INVENTORY_IGNORE_GLOBS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/*.original.md',
  '.agent/reference-local/**',
] as const;

/** Additional non-live or generated Markdown sources excluded from validation. */
const SOURCE_IGNORE_GLOBS = [
  ...INVENTORY_IGNORE_GLOBS,
  '**/archive/**',
  '.agents/**',
  '.claude/**',
  '.cursor/**',
  '.agent/state/collaboration/shared-comms-log.md',
  '.agent/state/collaboration/cross-worktree-work-state.md',
] as const;

/** Collect repo-relative POSIX paths matching the given globs, minus excluded paths. */
async function collectMarkdownPaths(
  patterns: readonly string[],
  ignoreGlobs: readonly string[],
): Promise<string[]> {
  const matches = await glob([...patterns], {
    cwd: repoRoot,
    dot: true,
    ignore: [...ignoreGlobs],
  });
  return matches.map((m) => m.split(path.sep).join('/')).filter((p) => !isExcludedPath(p));
}

/** Read the scan-source files into memory as {@link ScanFile} records. */
async function readScanFiles(relPaths: readonly string[]): Promise<ScanFile[]> {
  const files: ScanFile[] = [];
  for (const relPath of relPaths) {
    const content = await readText(repoRoot, relPath);
    files.push({ path: relPath, content });
  }
  return files;
}

/** Print the grouped broken-link report plus the totals summary. */
function reportBrokenLinks(report: MarkdownLinkReport): void {
  const { totals } = report;
  writeLine(
    `validate-markdown-links: ${String(totals.brokenLinks)} broken internal .md link(s) ` +
      `across ${String(totals.filesScanned)} scanned file(s) — ` +
      `${String(totals.autoFixable)} auto-fixable (unique basename), ` +
      `${String(totals.manual)} manual. BLOCKING.`,
  );

  if (report.byFile.length > 0) {
    writeLine('');
    writeLine('  Broken internal links by source file (written target -> suggested fix):');
    for (const group of report.byFile) {
      writeLine(`    ${group.sourcePath}:`);
      for (const link of group.links) {
        const fix = link.suggestedFix ?? '(manual — no unique match)';
        writeLine(`      L${String(link.line)}  ${link.writtenTarget}  ->  ${fix}`);
      }
    }
  }

  writeLine('');
  writeLine(
    `  Totals: ${String(totals.filesScanned)} files scanned, ` +
      `${String(totals.linksChecked)} internal .md links checked, ` +
      `${String(totals.brokenLinks)} broken, ` +
      `${String(totals.autoFixable)} auto-fixable, ${String(totals.manual)} manual.`,
  );
}

async function main(): Promise<void> {
  const scanPaths = await collectMarkdownPaths(SCAN_GLOBS, SOURCE_IGNORE_GLOBS);
  // The fix-candidate / existence inventory is every non-excluded .md file in
  // the repo, broader than the scan set, so cross-surface and repo-root-relative
  // links resolve and basename suggestions can point anywhere live.
  const repoFiles = await collectMarkdownPaths(['**/*.md'], INVENTORY_IGNORE_GLOBS);
  const files = await readScanFiles(scanPaths);

  const report = findBrokenLinks(files, repoFiles);

  if (report.totals.brokenLinks === 0) {
    writeLine('validate-markdown-links: OK (no broken internal .md links in scanned surfaces).');
    return;
  }

  reportBrokenLinks(report);
  process.exitCode = 1;
}

await main();
