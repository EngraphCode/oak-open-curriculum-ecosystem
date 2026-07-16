/**
 * Meta literal for the META stage workflow.
 *
 * @packageDocumentation
 */

import type { WorkflowMeta } from '../../corpus-analysis/workflows/workflow-meta.js';

/** META stage descriptor. */
export const meta = {
  name: 'restatement-audit-meta',
  description:
    "Checkpoint-4 (terminal): 1 meta agent (opus/high, Glob/Grep/Read, corpus-meta agentType) byte-verifies every flagged cluster's quotes against the live tree and assigns sourceOfTruth + proposedCure from the closed cure menu. Output is the fix-ledger the Director applies fixes from.",
  phases: [
    {
      title: 'meta',
      detail: '1 agent, opus/high, Glob/Grep/Read — byte-verify and assign the fix',
    },
  ],
} as const satisfies WorkflowMeta;
