import { type PlanStateTable } from '../plan-state-model.js';

/**
 * Status-mapping table v1 (the C1 seam's owning module): emergent recorded
 * TODO-status values → the canonical V0 claim pair. Placed judgement
 * (J2), versioned in-script like the census's `COMPLETION_KEYWORDS_V1`.
 *
 * DECLARED SCOPE (v1): todo-status instances only. Plan-LEVEL status values
 * (`superseded`, `active`, `strategic`, draft/gate strings, …) project onto
 * other V0 axes (`kind` / `disposition` / `gate` — schema §3.5) and are
 * deliberately NOT mapped: they surface as UNMAPPED residue, and the
 * engine's over-20% halt firing on them at r1's audit run is the designed
 * table-v2 trigger, not a defect.
 *
 * RATIFICATION: OG-2, presented for the owner sitting on the R0b PR (the
 * `freeze-rule.json` ratifiedBy precedent). The census document schema is
 * strict `{version, entries}`, so ratification state lives HERE, never
 * inside the table document. Until `STATUS_MAPPING_V1_RATIFICATION.status`
 * flips to `ratified`, r1 MUST NOT run audit mode against this table. If
 * ratification adds this table to a packet-listed ratified list, extend the
 * `validate-ratified-lists` validator — never a pin test.
 *
 * Entries are sorted by value and pre-trimmed (the census parse boundary
 * refuses untrimmed values and duplicates; shape compatibility with
 * `parseStatusMappingTable` is proven by test).
 *
 * @packageDocumentation
 */

/** The v1 table document — exactly the census's `{version, entries}` shape. */
export const STATUS_MAPPING_TABLE_V1: PlanStateTable = {
  version: 1,
  entries: [
    { value: 'complete', verdict: 'completed' },
    { value: 'completed', verdict: 'completed' },
    { value: 'done', verdict: 'completed' },
    { value: 'in-progress', verdict: 'pending' },
    { value: 'in_progress', verdict: 'pending' },
    { value: 'pending', verdict: 'pending' },
  ],
};

/** OG-2 ratification state for {@link STATUS_MAPPING_TABLE_V1} (see above). */
export const STATUS_MAPPING_V1_RATIFICATION = {
  gate: 'OG-2',
  status: 'pending-ratification',
} as const;
