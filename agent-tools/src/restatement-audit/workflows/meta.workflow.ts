/**
 * META stage workflow: byte-verify every flagged cluster's quotes and assign the fix.
 *
 * @remarks
 * Terminal stage — one agent, `Glob`/`Grep`/`Read` granted (`corpus-meta` agentType), no
 * concurrency to cap. `ledgerRowSchema` is strict, so a malformed or short response fails
 * the schema-forced structured-output call rather than landing a silently-incomplete
 * ledger.
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
  const { clusters } = RUN_DATA;
  log(`meta: byte-verifying ${clusters.length} flagged cluster(s)`);

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

  // Coverage is recomputed in code, never trusted from the agent: every flagged cluster
  // must have exactly one row whose id IS the cluster id.
  const clusterIds = new Set(clusters.map((cluster) => cluster.id));
  const rowIds = new Set(output.rows.map((row) => row.id));
  const missingRows = [...clusterIds].filter((id) => !rowIds.has(id));
  const orphanRows = [...rowIds].filter((id) => !clusterIds.has(id));
  if (missingRows.length > 0 || orphanRows.length > 0) {
    return {
      ok: false,
      error:
        `meta ledger coverage mismatch — cluster id(s) with no row: [${missingRows.join(', ')}]; ` +
        `row id(s) matching no flagged cluster: [${orphanRows.join(', ')}]`,
    };
  }

  log(`meta done: ${output.rows.length} ledger row(s)`);
  return { ok: true, rows: output.rows };
}
