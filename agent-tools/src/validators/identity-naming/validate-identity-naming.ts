#!/usr/bin/env node

/**
 * Identity-naming validator (PDS identity replacement).
 *
 * Enforces the owner-ratified end state of the `public-digital-service-identity`
 * plan (2026-08-03): the outgoing counter-identity's name and initialism must
 * not occur in any git-tracked file — contents or paths. Two census-driven
 * modes, one validator:
 *
 * - **Ratchet** (census present with entries): live per-file, per-kind,
 *   per-case-variant counts must EXACTLY equal the committed census
 *   (`.agent/reports/design/pds-identity-rename/census.json`). Above = a new
 *   occurrence; below = a stale census — the census update is the ratchet-down
 *   ceremony. The census's own path is excluded from the content scan (its
 *   `file` column necessarily carries the token).
 * - **Strict** (census empty or absent): zero occurrences, zero exclusions.
 *
 * The PATH leg is unconditional over every tracked path including binaries; the
 * CONTENT leg skips binary extensions and NUL-bearing files (the
 * machine-local-paths precedent). Forbidden tokens are string-constructed so
 * the gate never contains its own target. `--print-counts` emits the live
 * projection as JSON (the census authoring source). Wired into root
 * `repo-validators:check` (pre-commit AND CI). Exit 0 = clean; 1 = findings;
 * 2 = misconfiguration.
 *
 * @packageDocumentation
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readlinkSync } from 'node:fs';
import path from 'node:path';

import { z } from 'zod';

import { resolveRepoRoot } from '../../core/repo-root.js';
import { writeErrorLine, writeLine } from '../../core/terminal-output.js';
import { resolveTrustedGit } from '../../core/trusted-git.js';

import {
  CENSUS_PATH,
  compareToCensus,
  computeLiveCounts,
  type CensusEntry,
} from './validate-identity-naming-census.js';
import { findContentHits, hasAnyCount, type ScanFile } from './validate-identity-naming-tokens.js';

/** Null byte: the `git ls-files -z` record separator, and the binary-content marker. */
const NUL = '\u0000';

/** Binary extensions skipped by the CONTENT leg only (paths always scan). */
const SKIP_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.pdf',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.map',
  '.lock',
]);

/** Specific large generated files with no scannable prose. */
const SKIP_FILES = new Set(['pnpm-lock.yaml']);

/** List every tracked file, NUL-delimited so paths with spaces survive. */
function listTrackedFiles(repoRoot: string): string[] {
  const stdout = execFileSync(resolveTrustedGit(), ['ls-files', '-z'], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return stdout.split(NUL).filter((entry) => entry.length > 0);
}

/**
 * A tracked path's scannable text: a symlink's link text, else the file
 * content (the machine-local-paths precedent — `readlink` doubles as the
 * symlink test, EINVAL on regular files, so there is no stat-then-read race).
 */
function readLinkTextOrFile(absolute: string): string {
  try {
    return readlinkSync(absolute);
  } catch {
    return readFileSync(absolute, 'utf8');
  }
}

/**
 * Read the scannable text files. Fails loud (exit 2) on an unreadable tracked
 * file: silently skipping one would be a green-gate bypass.
 */
function readScanFiles(repoRoot: string, relativePaths: readonly string[]): ScanFile[] {
  const files: ScanFile[] = [];
  for (const relativePath of relativePaths) {
    if (SKIP_FILES.has(path.basename(relativePath))) {
      continue;
    }
    if (SKIP_EXTENSIONS.has(path.extname(relativePath))) {
      continue;
    }
    let content: string;
    try {
      content = readLinkTextOrFile(path.join(repoRoot, relativePath));
    } catch (error) {
      writeErrorLine(
        `validate-identity-naming: cannot read tracked file '${relativePath}'. ` +
          `Fix the file or its permissions — the scan must not skip a tracked file.`,
      );
      writeErrorLine(String(error));
      process.exit(2);
    }
    if (content.includes(NUL)) {
      continue;
    }
    files.push({ path: relativePath, content });
  }
  return files;
}

/** The census file's schema: strict validation at the boundary (zod, no assertions). */
const censusSchema = z.object({
  entries: z.array(
    z.object({
      file: z.string(),
      kind: z.union([z.literal('content'), z.literal('path')]),
      countByVariant: z.object({
        name: z.number(),
        initialismUpper: z.number(),
        initialismLower: z.number(),
      }),
    }),
  ),
});

/**
 * Load the census entries; `undefined` when the file does not exist. Exits 2
 * (misconfiguration) on unreadable or structurally invalid census content —
 * strict validation at the boundary, never a silent fallback.
 */
function loadCensus(repoRoot: string): CensusEntry[] | undefined {
  const absolute = path.join(repoRoot, CENSUS_PATH);
  if (!existsSync(absolute)) {
    return undefined;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(absolute, 'utf8'));
  } catch (error) {
    writeErrorLine(
      `validate-identity-naming: census at ${CENSUS_PATH} is unreadable or invalid JSON.`,
    );
    writeErrorLine(String(error));
    process.exit(2);
  }
  const result = censusSchema.safeParse(parsed);
  if (!result.success) {
    writeErrorLine(
      `validate-identity-naming: census at ${CENSUS_PATH} failed schema validation - ` +
        `each row needs file, kind (content|path), and numeric countByVariant.`,
    );
    writeErrorLine(z.prettifyError(result.error));
    process.exit(2);
  }
  return result.data.entries;
}

const repoRoot = resolveRepoRoot(import.meta.url);
const trackedPaths = listTrackedFiles(repoRoot);
if (trackedPaths.length === 0) {
  writeErrorLine('validate-identity-naming: zero tracked files scanned — refusing a vacuous pass.');
  process.exit(2);
}
const scannable = readScanFiles(repoRoot, trackedPaths);
const census = loadCensus(repoRoot);
const ratchetMode = census !== undefined && census.length > 0;

const live = computeLiveCounts(trackedPaths, scannable, ratchetMode ? CENSUS_PATH : undefined);

if (process.argv.includes('--print-counts')) {
  writeLine(JSON.stringify({ mode: ratchetMode ? 'ratchet' : 'strict', entries: live }, null, 2));
}

if (ratchetMode) {
  const findings = compareToCensus(live, census);
  if (findings.length === 0) {
    writeLine(
      `✓ identity-naming ratchet: live counts match the census exactly ` +
        `(${live.length} carrier(s) across ${trackedPaths.length} tracked files)`,
    );
    process.exit(0);
  }
  writeErrorLine(`✖ identity-naming ratchet: ${findings.length} divergence(s) from the census:`);
  for (const finding of findings) {
    writeErrorLine(
      `  [${finding.reason}] ${finding.kind} ${finding.file} — live ` +
        `${JSON.stringify(finding.live)} vs census ${JSON.stringify(finding.census)}`,
    );
  }
  writeErrorLine('');
  writeErrorLine(
    'A new occurrence of the outgoing identity is forbidden (plan public-digital-service-identity); ' +
      'a removal must update the census in the same change — that update IS the ratchet-down ceremony.',
  );
  process.exit(1);
}

const carriers = live.filter((entry) => hasAnyCount(entry.countByVariant));
if (carriers.length === 0) {
  writeLine(
    `✓ identity-naming strict: zero occurrences across ${trackedPaths.length} tracked files`,
  );
  process.exit(0);
}
writeErrorLine(`✖ identity-naming strict: ${carriers.length} carrier(s) found:`);
for (const entry of carriers) {
  if (entry.kind === 'path') {
    writeErrorLine(`  path ${entry.file} — ${JSON.stringify(entry.countByVariant)}`);
    continue;
  }
  const content = scannable.find((file) => file.path === entry.file)?.content ?? '';
  for (const hit of findContentHits(entry.file, content)) {
    writeErrorLine(`  ${hit.file}:${hit.line}:${hit.column}  [${hit.variant}]`);
  }
}
writeErrorLine('');
writeErrorLine(
  'The outgoing identity must not exist in the tracked tree (owner word 2026-08-03; ' +
    'plan public-digital-service-identity). Rename per the plan; never re-introduce.',
);
process.exit(1);
