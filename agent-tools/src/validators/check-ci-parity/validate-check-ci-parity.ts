import fs from 'node:fs/promises';
import path from 'node:path';

import { err, ok, type Result } from '@oaknational/result';

import { resolveRepoRoot } from '../../core/repo-root.js';
import { writeErrorLine, writeLine } from '../../core/terminal-output.js';

import { findParityGaps, parseCheckLegs, parseCiCoverage } from './check-ci-parity-helpers.js';

/**
 * Standalone validator asserting every leg of the root `pnpm check`
 * aggregate is gated in CI — the recursion-closing guard for the AIP-165
 * class, where a check leg exists locally (`skills:check`) but no CI step
 * runs it, so its defect class merges green and only surfaces on a local
 * full run.
 *
 * Both sides are recomputed at every run (validators must recompute, never
 * just record): the `check` script is parsed from the live root
 * `package.json`, and coverage is parsed from the live workflow files under
 * `.github/workflows/`. Adding a leg to `check` without a CI step fails
 * this validator — which itself runs in CI via `repo-validators:check`, the
 * chain it validates.
 *
 * @packageDocumentation
 */

const repoRoot = resolveRepoRoot(import.meta.url);

/**
 * Root scripts whose CI equivalence is structural rather than a step.
 *
 * - `clean` — locally it wipes build outputs so `check` proves a real
 *   rebuild; every CI job starts from a fresh checkout, so the runner
 *   provides the same guarantee by construction.
 *
 * Each entry is a named design decision; adding one requires stating the
 * structural argument here, which is what keeps this a decision table and
 * not a bypass surface.
 */
const STRUCTURALLY_EQUIVALENT_SCRIPTS: readonly string[] = ['clean'];

async function readCheckScript(): Promise<Result<string, Error>> {
  const packageJsonPath = path.join(repoRoot, 'package.json');
  const raw = await fs.readFile(packageJsonPath, 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('scripts' in parsed) ||
    typeof parsed.scripts !== 'object' ||
    parsed.scripts === null ||
    !('check' in parsed.scripts) ||
    typeof parsed.scripts.check !== 'string'
  ) {
    return err(new Error(`no string \`check\` script found in ${packageJsonPath}`));
  }
  return ok(parsed.scripts.check);
}

/**
 * The single PR-gating workflow. Coverage counts ONLY from here: its
 * `run-quality-gates` fan-in is the required status check, so its jobs
 * block merges. Other workflows (e.g. release.yml, which runs after a
 * successful main push) cannot gate a pull request, and counting their
 * commands as coverage would satisfy parity with a non-blocking run.
 */
const PR_GATING_WORKFLOW = '.github/workflows/ci.yml';

async function readWorkflowText(): Promise<Result<string, Error>> {
  const workflowPath = path.join(repoRoot, PR_GATING_WORKFLOW);
  try {
    return ok(await fs.readFile(workflowPath, 'utf8'));
  } catch {
    return err(
      new Error(
        `the PR-gating workflow is unreadable at ${workflowPath} — if the workflow moved, ` +
          `update PR_GATING_WORKFLOW in this validator`,
      ),
    );
  }
}

async function main(): Promise<void> {
  const [checkScript, workflowText] = await Promise.all([readCheckScript(), readWorkflowText()]);
  if (!checkScript.ok) {
    writeErrorLine(`validate-check-ci-parity: ${checkScript.error.message}`);
    process.exit(2);
  }
  if (!workflowText.ok) {
    writeErrorLine(`validate-check-ci-parity: ${workflowText.error.message}`);
    process.exit(2);
  }

  const legs = parseCheckLegs(checkScript.value);
  const coverage = parseCiCoverage(workflowText.value);
  const gaps = findParityGaps(legs, coverage, STRUCTURALLY_EQUIVALENT_SCRIPTS);

  if (gaps.length === 0) {
    writeLine(
      `validate-check-ci-parity: OK (${String(legs.scripts.length)} script legs + ` +
        `${String(legs.turboTasks.length)} turbo tasks all CI-gated)`,
    );
    return;
  }

  const formatted = gaps.map((gap) => `  [${gap.kind}] ${gap.name}`).join('\n');
  writeErrorLine(
    `validate-check-ci-parity: ${String(gaps.length)} check leg(s) have no CI coverage.\n\n` +
      `${formatted}\n\n` +
      `Every leg of the root \`pnpm check\` aggregate must be gated in CI. Add a workflow step ` +
      `running each leg above (or, where the CI runner provides the guarantee by construction, ` +
      `add the script to STRUCTURALLY_EQUIVALENT_SCRIPTS in this validator with its structural ` +
      `argument).`,
  );
  process.exit(1);
}

await main();
