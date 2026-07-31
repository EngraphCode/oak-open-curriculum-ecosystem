/**
 * Shared corpus-loading plumbing for the plan-schema instruments.
 *
 * @remarks
 * Both composition roots — `validate-plan-corpus.ts` (blocking
 * conformance gate) and `check-plan-gate-drift.ts` (non-blocking
 * persistent alert) — walk the same corpus root and parse the same
 * `*.plan.md` files; this module is that shared walk, extracted at the
 * second consumer. It owns file discovery and per-file parsing only;
 * what each instrument does with the parsed corpus stays its own.
 *
 * @packageDocumentation
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { isErr } from '@oaknational/result';

import { type ParsedPlanFile, type PlanConformanceFailure } from './plan-corpus-types.js';
import { validatePlanFile } from './validate-plan-corpus-helpers.js';

/** The live corpus root, relative to the repo root. */
const CORPUS_ROOT = '.agent/plans';

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

/** The parsed corpus: per-file failures split from file-level-valid plans. */
export interface ParsedCorpus {
  readonly fileFailures: PlanConformanceFailure[];
  readonly parsed: ParsedPlanFile[];
}

/**
 * Discover and parse the whole corpus under the repo's live corpus
 * root, sorted for deterministic report order.
 */
export async function loadCorpus(repoRoot: string): Promise<ParsedCorpus> {
  const planPaths = (await collectPlanFiles(path.join(repoRoot, CORPUS_ROOT))).toSorted((a, b) =>
    a.localeCompare(b),
  );
  const fileFailures: PlanConformanceFailure[] = [];
  const parsed: ParsedPlanFile[] = [];
  for (const planPath of planPaths) {
    const relative = path.relative(repoRoot, planPath);
    const content = await readFile(planPath, 'utf8');
    const result = validatePlanFile(relative, content);
    if (isErr(result)) {
      fileFailures.push(result.error);
    } else {
      parsed.push({ path: relative, node: result.value });
    }
  }
  return { fileFailures, parsed };
}
