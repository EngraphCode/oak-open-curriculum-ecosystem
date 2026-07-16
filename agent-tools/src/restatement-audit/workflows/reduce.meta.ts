/**
 * Meta literal for the REDUCE stage workflow.
 *
 * @packageDocumentation
 */

import type { WorkflowMeta } from '../../corpus-analysis/workflows/workflow-meta.js';

/** REDUCE stage descriptor. */
export const meta = {
  name: 'restatement-audit-reduce',
  description:
    'Checkpoint-2: code-first exact-key join (deterministic, zero agents) over gazetteer-resolved instances, then up to 3 reducer calls (opus/high, zero tools) proposing clusters over free-text-subject residuals only. Every reducer proposal is RECOUNTED by code before inclusion — the reducer clusters, code verdicts.',
  phases: [
    {
      title: 'exact-key-join',
      detail: 'deterministic code join over gazetteer-resolved instances, zero agents',
    },
    {
      title: 'reduce',
      detail: 'up to 3 reducer calls, opus/high, zero tools — free-text residuals only',
    },
  ],
} as const satisfies WorkflowMeta;
