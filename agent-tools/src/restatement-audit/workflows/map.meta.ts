/**
 * Meta literal for the MAP stage workflow. Pure literal, no value imports — the harness
 * emitter serialises it verbatim as the artefact's static `export const meta`.
 *
 * @packageDocumentation
 */

import type { WorkflowMeta } from '../../workflow-build/workflow-meta.js';

/** MAP stage descriptor. */
export const meta = {
  name: 'restatement-audit-map',
  description:
    'Checkpoint-1a: map ONLY (Sonnet/low, concurrency-capped + jittered, corpus-mapper agentType) over the seeded T3 window partition — extract quote-anchored restatement instances via the compiled five-trigger-class decision procedure. Returns a typed envelope with per-window coverage and an explicit completeness verdict; the operator commits the instances checkpoint before running reduce, so a reduce failure never re-spends this map.',
  phases: [
    {
      title: 'map',
      detail:
        'N windows, Sonnet/low, capped at 4 in flight — extract quote-anchored restatement instances',
    },
  ],
} as const satisfies WorkflowMeta;
