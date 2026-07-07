import { ROW_CLASSES_V1, type PlanStateReport, type RowClass } from './plan-state-model.js';

/**
 * The gate-verdict side of the plan-state engine: the total gate-effect map
 * (the code form of the gate-semantics table in `plan-state-model.ts`), the
 * pure exit-code contract, and the byte-stable report serialiser. Split from
 * `plan-state-engine.ts` so each side stays within the size gate; the
 * derivation side owns everything up to the report, this side owns what the
 * operator and the artefact consumer see.
 *
 * @packageDocumentation
 */

/** The gate's decided verdict: exit code plus unprefixed operator lines. */
export interface GateVerdict {
  readonly exitCode: number;
  readonly lines: readonly string[];
}

/**
 * The total gate-effect map over the closed row-class set — the code form of
 * the gate-semantics table in `plan-state-model.ts`. Adding a row class
 * fails compilation until its gate effect is declared here, so a future
 * divergence class can never default to non-gating (fail-open).
 */
const GATE_EFFECT: Readonly<Record<RowClass, 'gates' | 'counted'>> = {
  consistent: 'counted',
  'recorded-done-but-red': 'gates',
  'recorded-pending-but-green': 'gates',
  'unmapped-status': 'counted',
  'no-evidence': 'counted',
  attested: 'counted',
};

/**
 * Decide the gate verdict from a derived report — pure, so the exit-code
 * contract is unit-testable. RED on the {@link GATE_EFFECT} gating classes
 * ONLY; the counted classes are reported, never gating; a vacuous report
 * refuses to pass (exit non-zero) because a gate that scanned nothing must
 * not read as green; and a green with zero recomputed rows names itself
 * unverified so exit 0 is never mistaken for verified state.
 */
export function decideGateVerdict(report: PlanStateReport): GateVerdict {
  if (report.summary.vacuous) {
    return {
      exitCode: 1,
      lines: ['plan-state gate: VACUOUS — zero rows scanned; a gate over nothing never passes.'],
    };
  }
  const countOf = (rowClass: RowClass): number =>
    report.summary.byClass.find((entry) => entry.rowClass === rowClass)?.count ?? 0;
  const gatingLine = ROW_CLASSES_V1.filter((rowClass) => GATE_EFFECT[rowClass] === 'gates')
    .map((rowClass) => `${rowClass} ${String(countOf(rowClass))}`)
    .join(', ');
  const redCount = ROW_CLASSES_V1.filter((rowClass) => GATE_EFFECT[rowClass] === 'gates').reduce(
    (total, rowClass) => total + countOf(rowClass),
    0,
  );
  const counted =
    `${String(report.summary.rows)} row(s); UNMAPPED ${String(report.summary.unmapped.count)}, ` +
    `no-evidence ${String(countOf('no-evidence'))}, attested ${String(countOf('attested'))}`;
  if (redCount > 0) {
    return { exitCode: 1, lines: [`plan-state gate: RED — ${gatingLine} (${counted}).`] };
  }
  if (countOf('consistent') === 0) {
    return {
      exitCode: 0,
      lines: [`plan-state gate: green — no recomputation performed (${counted}).`],
    };
  }
  return { exitCode: 0, lines: [`plan-state gate: green (${counted}).`] };
}

/** Serialise a report byte-stably (two-space indent, trailing newline). */
export function serialisePlanStateReport(report: PlanStateReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}
