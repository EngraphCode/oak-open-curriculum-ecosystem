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
 * RATIFICATION: OG-2 table half, RATIFIED 2026-07-08 (owner ruling, put as
 * a formal question and answered; relayed to the R0c seat by directed comms
 * event — the `freeze-rule.json` ratifiedBy precedent). The census document
 * schema is strict `{version, entries}`, so ratification state lives HERE,
 * never inside the table document; the flip below is the mechanical unlock
 * for r1's audit mode on the default table. The table is not packet-listed,
 * so `validate-ratified-lists` carries no entry for it; if a future packet
 * lists it, extend the validator — never a pin test.
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

/**
 * OG-2 ratification state for {@link STATUS_MAPPING_TABLE_V1} (see above).
 * The type declares the flip axis; the runner MECHANICALLY refuses audit
 * mode on the default table while this reads `pending-ratification` (the
 * prose constraint enforced in code — see `plan-state-helpers.ts`).
 */
export const STATUS_MAPPING_V1_RATIFICATION: {
  readonly gate: 'OG-2';
  readonly status: 'pending-ratification' | 'ratified';
} = {
  gate: 'OG-2',
  status: 'ratified',
};
