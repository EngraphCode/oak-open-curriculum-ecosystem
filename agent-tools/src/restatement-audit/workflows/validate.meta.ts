/**
 * Meta literal for the VALIDATE stage workflow.
 *
 * @packageDocumentation
 */

import type { WorkflowMeta } from '../../corpus-analysis/workflows/workflow-meta.js';

/** VALIDATE stage descriptor. */
export const meta = {
  name: 'restatement-audit-validate',
  description:
    'Checkpoint-3: 2 independent voters (sonnet/high, zero tools, corpus-voter agentType) per judgment-needed cluster judge the four conjunctive tests (sameFact, authoredNotCited, genuineConflict, liveSurface). Code computes the disposition — flagged only when both voters pass all four; the voter never emits one.',
  phases: [
    {
      title: 'validate',
      detail: '2 voters per cluster, sonnet/high, zero tools — four conjunctive tests',
    },
  ],
} as const satisfies WorkflowMeta;
