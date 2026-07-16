/**
 * META stage workflow: byte-verify every flagged cluster's quotes and assign the fix,
 * then carry the code-built held-for-review rows into the same ledger.
 *
 * @remarks
 * Terminal stage — one agent, `Glob`/`Grep`/`Read` granted (`corpus-meta` agentType), no
 * concurrency to cap. `metaAgentRowSchema` is strict, so a malformed response fails the
 * schema-forced structured-output call — but the ≥2 member floor is a zod refine the
 * derived JSON schema cannot carry, so `checkLedgerCoverage` re-enforces it in-stage
 * (the cheap failure point; the Node re-parse boundary re-checks it downstream). Code
 * stamps `disposition: 'flagged'` on the agent's rows and appends the held rows
 * (`composeMetaLedger`), so the ledger is the COMPLETE disposition surface — an
 * all-held audit renders as held-marked rows, never as clean.
 *
 * @packageDocumentation
 */

import type {
  HarnessAgent,
  HarnessLog,
  HarnessPhase,
} from '../../corpus-analysis/workflows/harness-types.js';
import { AGENT_JSON_SCHEMAS } from './agent-schemas.js';
import type { MetaStageOutput } from './agent-schemas.js';
import {
  checkLedgerCoverage,
  composeMetaLedger,
  heldLedgerRows,
  zeroFlaggedShortCircuit,
} from './meta-coverage.js';
import { metaPrompt } from './prompts.js';
import { RUN_DATA, RUN_DATA_STAGE } from './run-data.js';
import { isMetaRunData, unseededRunDataError } from './stage-guards.js';
import type { MetaResult } from './stage-io.js';

declare const agent: HarnessAgent;
declare const phase: HarnessPhase;
declare const log: HarnessLog;

/** Run the meta stage over the seeded flagged clusters. */
export async function main(): Promise<MetaResult> {
  phase('meta');
  if (!isMetaRunData(RUN_DATA, RUN_DATA_STAGE)) {
    return { ok: false, error: unseededRunDataError('meta') };
  }
  const { clusters, heldClusters } = RUN_DATA;
  const heldRows = heldLedgerRows(heldClusters);
  const shortCircuit = zeroFlaggedShortCircuit(clusters, heldRows);
  if (shortCircuit !== null) {
    log(
      heldRows.length === 0
        ? 'meta: zero flagged clusters — clean audit, empty ledger, no agent dispatched'
        : `meta: zero flagged clusters — ${heldRows.length} held-for-review row(s) carried to the ledger, no agent dispatched`,
    );
    return shortCircuit;
  }
  log(
    `meta: byte-verifying ${clusters.length} flagged cluster(s); ${heldRows.length} held-for-review row(s) carried`,
  );

  const output = await agent<MetaStageOutput>(metaPrompt(clusters), {
    label: 'meta',
    phase: 'meta',
    model: 'opus',
    effort: 'high',
    agentType: 'corpus-meta',
    schema: AGENT_JSON_SCHEMAS.metaStage,
  });
  if (output === null) {
    return {
      ok: false,
      error: 'meta agent died terminally (retry-cap or quota) — zero ledger rows produced',
    };
  }

  const coverageError = checkLedgerCoverage(clusters, output.rows);
  if (coverageError !== null) {
    return { ok: false, error: coverageError };
  }

  const rows = composeMetaLedger(output.rows, heldRows);
  log(
    `meta done: ${output.rows.length} flagged + ${heldRows.length} held-for-review ledger row(s)`,
  );
  return { ok: true, rows };
}
