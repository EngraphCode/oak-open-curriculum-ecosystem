/**
 * PDR-131 throughput register — the pure computation core.
 *
 * @remarks
 * Turns the merge-concurrency doctrine (PDR-131) into applied fact: from a
 * merged-PR corpus it computes merges-to-main/day and open-to-merged cycle
 * time p50/p90 over a trailing window, and renders dated register rows so
 * the trend is diffable. IO (the `gh` fetch, the register file) lives in the
 * CLI seams; everything here is deterministic and injectable.
 *
 * @packageDocumentation
 */

/** One merged PR as the boundary hands it over (ISO date strings). */
export interface MergedPrRecord {
  readonly number: number;
  readonly createdAt: string;
  readonly mergedAt: string;
  readonly isDraft: boolean;
  readonly headRefName: string;
}

/** The computed trailing-window throughput view. */
export interface ThroughputReport {
  readonly windowDays: number;
  readonly windowEnd: string;
  readonly mergedCount: number;
  readonly mergesPerDay: number;
  readonly cycleTimeP50Minutes: number | null;
  readonly cycleTimeP90Minutes: number | null;
  readonly excludedDraftCount: number;
  readonly excludedCoordinationCount: number;
}

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

/** The coordination-tracker branch family excluded from throughput counts. */
const COORDINATION_BRANCH_PREFIX = 'coordination/';

/**
 * Compute the trailing-window throughput report. Only PRs merged inside
 * `(now - windowDays, now]` count; drafts and coordination trackers are
 * excluded and COUNTED (a silent cap would read as covered-everything).
 * Empty-window percentiles are null, never fabricated zeros.
 */
export function computeThroughput(
  prs: readonly MergedPrRecord[],
  input: { readonly windowDays: number; readonly now: Date },
): ThroughputReport {
  const windowStart = input.now.getTime() - input.windowDays * DAY_MS;
  const inWindow = prs.filter((pr) => {
    const mergedAt = Date.parse(pr.mergedAt);
    return mergedAt > windowStart && mergedAt <= input.now.getTime();
  });

  const drafts = inWindow.filter((pr) => pr.isDraft);
  const coordination = inWindow.filter(
    (pr) => !pr.isDraft && pr.headRefName.startsWith(COORDINATION_BRANCH_PREFIX),
  );
  const counted = inWindow.filter(
    (pr) => !pr.isDraft && !pr.headRefName.startsWith(COORDINATION_BRANCH_PREFIX),
  );

  const cycleMinutes = counted
    .map((pr) => (Date.parse(pr.mergedAt) - Date.parse(pr.createdAt)) / MINUTE_MS)
    .sort((left, right) => left - right);

  return {
    windowDays: input.windowDays,
    windowEnd: input.now.toISOString(),
    mergedCount: counted.length,
    mergesPerDay: counted.length / input.windowDays,
    cycleTimeP50Minutes: nearestRankPercentile(cycleMinutes, 0.5),
    cycleTimeP90Minutes: nearestRankPercentile(cycleMinutes, 0.9),
    excludedDraftCount: drafts.length,
    excludedCoordinationCount: coordination.length,
  };
}

/** Nearest-rank percentile over an ASCENDING-sorted list; null when empty. */
function nearestRankPercentile(sortedValues: readonly number[], quantile: number): number | null {
  if (sortedValues.length === 0) {
    return null;
  }

  const rank = Math.ceil(quantile * sortedValues.length);

  return sortedValues[Math.max(0, rank - 1)];
}

/**
 * Render one register row: date, window, merges, merges/day, p50, p90, note.
 * The note is sanitised for the Markdown table: pipes encode as the HTML
 * entity (delimiter-safe regardless of preceding backslash parity — a
 * backslash-escape would flip meaning after `a\|`) and line breaks collapse
 * to spaces, so a free-text note can never add columns or rows.
 */
export function formatRegisterRow(
  report: ThroughputReport,
  input: { readonly note: string },
): string {
  const note = input.note.replaceAll(/\s*[\r\n]+\s*/gu, ' ').replaceAll('|', '&#124;');
  const date = report.windowEnd.slice(0, 10);
  const p50 =
    report.cycleTimeP50Minutes === null ? '-' : String(Math.round(report.cycleTimeP50Minutes));
  const p90 =
    report.cycleTimeP90Minutes === null ? '-' : String(Math.round(report.cycleTimeP90Minutes));

  return `| ${date} | ${report.windowDays}d | ${report.mergedCount} | ${report.mergesPerDay.toFixed(2)} | ${p50} | ${p90} | ${note} |`;
}

/**
 * The register's standing header: what the numbers mean and the PDR-130-style
 * prediction with its falsifier — the piece that makes PDR-131 measurable
 * rather than merely asserted.
 */
export const REGISTER_HEADER = `# PR throughput register (PDR-131)

Fitness-informational trend register written by \`pnpm agent-tools:pr-throughput\`
(always exit 0). Each row is one trailing-window reading over non-draft PRs
merged to \`main\`, excluding coordination trackers (\`coordination/*\` head
branches). Cycle time is open-to-merged, in minutes, nearest-rank percentiles.

Governing doctrine (both records ride the coordination branch until its next
main reconciliation):
[PDR-131 — merge concurrency is free; quality binds at settled-READY](https://github.com/oaknational/oak-open-curriculum-ecosystem/blob/coordination/estate-2026-07/.agent/practice-core/decision-records/PDR-131-merge-concurrency-is-free-quality-binds-at-settled-ready.md)
supplies the mechanics this register measures;
[PDR-130 — two-speed learning](https://github.com/oaknational/oak-open-curriculum-ecosystem/blob/coordination/estate-2026-07/.agent/practice-core/decision-records/PDR-130-two-speed-learning.md)
supplies the prediction form (a falsifiable prediction whose failure triggers
investigation, never retelling).

**Prediction (PDR-130 form):** under PDR-131 mechanics (settled-READY + green
checks arm auto-merge under Director grant; concurrent landings normal) with
the strict-currency ruleset policy dropped, the measured cycle-time p50 —
across ALL counted PRs, since no story-size classification exists in the
record — falls below ~45 minutes as single-story PRs stop queueing behind
the serial treadmill. **Falsifier:** two consecutive weekly windows with p50
above 45 minutes means the doctrine is not being applied (or the aggregate
proxy hides the effect — either way, the actual binding constraint gets
investigated instead of the claim being retold).

| Date | Window | Merges | Merges/day | p50 (min) | p90 (min) | Note |
| ---- | ------ | ------ | ---------- | --------- | --------- | ---- |
`;
