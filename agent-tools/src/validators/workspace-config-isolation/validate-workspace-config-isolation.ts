#!/usr/bin/env node

/**
 * Workspace-config-isolation validator.
 *
 * Enforces the owner's rule verbatim — "Workspaces must NEVER import
 * from outside of themselves except via explicit package.json
 * dependencies" — over every tracked workspace tooling config file, and
 * keeps turbo's `$TURBO_ROOT$` inputs honest (a stale input silently
 * hashes zero files; turbo emits no warning). Predicate semantics and
 * the two scanned pattern classes live in the helpers module; this bin
 * only performs I/O and composes them.
 *
 * Wired into root `repo-validators:check` (pre-commit + CI). Runs from
 * source via tsx — the CI static-checks job installs without building,
 * so this file imports nothing from any built workspace package.
 *
 * Exit 0 = clean; exit 1 = at least one escape or stale turbo input;
 * exit 2 = refusal — an unanalysable construct or unreadable input (the
 * scan never silently skips).
 *
 * @packageDocumentation
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { parse as parseYaml } from 'yaml';

import { resolveRepoRoot } from '../../core/repo-root.js';
import { writeErrorLine, writeLine } from '../../core/terminal-output.js';
import { listTrackedFiles } from '../../core/tracked-file-scan.js';

import {
  expandWorkspaceGlobs,
  findConfigEscapes,
  isWorkspaceConfigFile,
  resolveOwner,
  type EscapeFinding,
  type UnanalysableFinding,
} from './containment.js';
import { scanTurboRootInputs } from './turbo-inputs.js';

const repoRoot = resolveRepoRoot(import.meta.url);

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const manifest: unknown = parseYaml(readRepoFile('pnpm-workspace.yaml'));
const packagesEntry =
  typeof manifest === 'object' && manifest !== null && 'packages' in manifest
    ? manifest.packages
    : undefined;
if (!Array.isArray(packagesEntry) || !packagesEntry.every((entry) => typeof entry === 'string')) {
  writeErrorLine(
    'validate-workspace-config-isolation: pnpm-workspace.yaml has no string-list `packages` key',
  );
  process.exit(2);
}

const trackedFiles = listTrackedFiles(repoRoot);
const workspaceDirs = expandWorkspaceGlobs(packagesEntry, trackedFiles);
const configFiles = trackedFiles.filter((file) => isWorkspaceConfigFile(file));

const escapes: EscapeFinding[] = [];
const unanalysable: UnanalysableFinding[] = [];
for (const file of configFiles) {
  const owner = resolveOwner(workspaceDirs, file);
  const result = findConfigEscapes({ file, content: readRepoFile(file), owner });
  escapes.push(...result.escapes);
  unanalysable.push(...result.unanalysable);
}

const turboFindings = scanTurboRootInputs({
  turboJsonText: readRepoFile('turbo.json'),
  fileExists: (relativePath) => existsSync(path.join(repoRoot, relativePath)),
});

if (unanalysable.length > 0) {
  writeErrorLine(
    `✖ ${String(unanalysable.length)} unanalysable construct(s) — the scan refuses rather than guessing:`,
  );
  for (const finding of unanalysable) {
    writeErrorLine(`  ${finding.file}:${String(finding.line)}  ${finding.reason}`);
  }
  process.exit(2);
}

if (escapes.length === 0 && turboFindings.length === 0) {
  writeLine(
    `✓ workspace-config isolation holds (${String(configFiles.length)} config files, ` +
      `${String(workspaceDirs.length)} workspaces, turbo inputs resolve)`,
  );
  process.exit(0);
}

if (escapes.length > 0) {
  writeErrorLine(`✖ ${String(escapes.length)} workspace-config escape(s):`);
  for (const finding of escapes) {
    const owner = finding.owner === '' ? '<repo root>' : finding.owner;
    writeErrorLine(
      `  ${finding.file}:${String(finding.line)}  '${finding.specifier}' resolves to ` +
        `'${finding.resolved}', outside ${owner}`,
    );
  }
  writeErrorLine(
    'Import shared config through @oaknational/workspace-config (a declared workspace:* ' +
      'dependency), never by a relative path that leaves the workspace. See ' +
      '.agent/plans/delivery/workspace-config-isolation.plan.md.',
  );
}

if (turboFindings.length > 0) {
  writeErrorLine(`✖ ${String(turboFindings.length)} stale $TURBO_ROOT$ input(s) in turbo.json:`);
  for (const finding of turboFindings) {
    writeErrorLine(`  turbo.json:${String(finding.line)}  ${finding.entry}`);
  }
  writeErrorLine(
    'turbo silently hashes zero files for an input that matches nothing — delete the entry ' +
      'or point it at a file that exists.',
  );
}

process.exit(1);
