#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { isErr, type Result } from '@oaknational/result';

import { resolveRepoRoot } from '../../core/repo-root.js';
import { writeErrorLine, writeLine } from '../../core/terminal-output.js';
import {
  recomputeChoiceRegistry,
  validatePlanFile,
  type ChoiceRegistry,
  type PlanConformanceFailure,
} from './validate-plan-corpus-helpers.js';

/**
 * Plan-corpus validator: every `*.plan.md` under the live corpus root
 * conforms to the V0 plan-node contract, with `serves_strategic_choice`
 * resolving against the recomputed strategic-choice registry.
 *
 * **Scan root is the admission rule drawn as a directory boundary**: only
 * `.agent/plans/` is scanned. The backlogged estate
 * (`.agent/plans-backlog-2026-07/`) and the paused refounding are outside
 * by construction — the corpus stays minimal without a pruning ceremony.
 * `node_type` dispatch is file-suffix-shaped: only `*.plan.md` files are
 * plan nodes; spec files (e.g. `plan-node-schema.v0.md`) and READMEs are
 * not scanned. An EMPTY corpus (zero plan files) is a failure, never a
 * vacuous green — the corpus was founded with members.
 *
 * CI coverage rides `repo-validators:check` (CI static-checks); the
 * check↔CI parity validator guards that aggregate wiring.
 *
 * @packageDocumentation
 */

const CORPUS_ROOT = '.agent/plans';
const STRATEGY_DIR = 'docs/strategy';
const repoRoot = resolveRepoRoot(import.meta.url);

/** Recursively collect `*.plan.md` files under a directory. */
async function collectPlanFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const collected: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collected.push(...(await collectPlanFiles(full)));
    } else if (entry.name.endsWith('.plan.md')) {
      collected.push(full);
    }
  }
  return collected;
}

/** Read both strategy surfaces and recompute the choice registry. */
async function loadRegistry(): Promise<Result<ChoiceRegistry, Error>> {
  const strategyDir = path.join(repoRoot, STRATEGY_DIR);
  const readmeContent = await readFile(path.join(strategyDir, 'README.md'), 'utf8');
  const streamNames = (await readdir(strategyDir)).filter(
    (name) => name.startsWith('stream-') && name.endsWith('.md'),
  );
  const streamContents = await Promise.all(
    streamNames.map(async (name) => readFile(path.join(strategyDir, name), 'utf8')),
  );
  return recomputeChoiceRegistry(readmeContent, streamContents);
}

/** Print the per-file conformance failures, path-anchored. */
function reportFailures(failures: readonly PlanConformanceFailure[]): void {
  writeErrorLine(`validate-plan-corpus: ${String(failures.length)} non-conformant plan file(s):`);
  for (const failure of failures) {
    writeErrorLine(`  ${failure.path}`);
    for (const message of failure.messages) {
      writeErrorLine(`    - ${message}`);
    }
  }
}

async function main(): Promise<number> {
  const registry = await loadRegistry();
  if (isErr(registry)) {
    writeErrorLine(`validate-plan-corpus: ${registry.error.message}`);
    return 1;
  }
  const planFiles = await collectPlanFiles(path.join(repoRoot, CORPUS_ROOT));
  if (planFiles.length === 0) {
    writeErrorLine(
      `validate-plan-corpus: no *.plan.md files under ${CORPUS_ROOT}/ — an empty corpus is a failure, not a vacuous green`,
    );
    return 1;
  }
  const failures: PlanConformanceFailure[] = [];
  for (const file of planFiles.sort((a, b) => a.localeCompare(b))) {
    const content = await readFile(file, 'utf8');
    const result = validatePlanFile(path.relative(repoRoot, file), content, registry.value);
    if (isErr(result)) {
      failures.push(result.error);
    }
  }
  if (failures.length > 0) {
    reportFailures(failures);
    return 1;
  }
  writeLine(
    `validate-plan-corpus: OK (${String(planFiles.length)} plan file(s) conform to the V0 contract; registry: ${String(registry.value.ids.size)} choice IDs across ${String(registry.value.families.size)} families).`,
  );
  return 0;
}

process.exitCode = await main();
