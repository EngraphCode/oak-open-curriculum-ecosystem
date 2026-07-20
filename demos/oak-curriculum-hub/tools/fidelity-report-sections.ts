/*
 * The report's standalone list sections — global-scope judgments, orphaned
 * register entries, and export-exempt surfaces. Extracted from
 * fidelity-report.ts so the renderer module stays within its size budget;
 * same pure-renderer contract (no IO).
 */
import type { PairingMap } from './fidelity-pairs';
import { GLOBAL_PAIR_ID, type FidelityRegister } from './fidelity-register';
import { escapeHtml } from './fidelity-html';

/** Judgments recorded against the reserved global scope — they apply to every
 *  pair (a token-source migration, a repo-wide focus-ring change), so they get
 *  their own section rather than repeating under each pair or reading as
 *  orphans. */
export function globalEntriesSection(register: FidelityRegister): string {
  const globals = register.entries.filter((entry) => entry.pairId === GLOBAL_PAIR_ID);
  if (globals.length === 0) {
    return '';
  }
  const items = globals
    .map(
      (entry) =>
        `<li><code>${escapeHtml(entry.id)}</code> (${escapeHtml(entry.disposition)}) — ${escapeHtml(entry.summary)}</li>`,
    )
    .join('\n');
  return `<section>
<h2>Global judgments (apply to every pair)</h2>
<ul>${items}</ul>
</section>`;
}

export function orphanedEntries(
  livePairIds: ReadonlySet<string>,
  register: FidelityRegister,
): string {
  const orphans = register.entries.filter(
    (entry) => entry.pairId !== GLOBAL_PAIR_ID && !livePairIds.has(entry.pairId),
  );
  if (orphans.length === 0) {
    return '';
  }
  const items = orphans
    .map(
      (entry) =>
        `<li><code>${escapeHtml(entry.id)}</code> — its pair no longer exists; candidate for the <code>superseded</code> disposition.</li>`,
    )
    .join('\n');
  return `<section>
<h2>Register entries without a live pair</h2>
<ul>${items}</ul>
</section>`;
}

export function exemptSection(map: PairingMap): string {
  const items = map.exemptSurfaces
    .map(
      (surface) =>
        `<li><code>${escapeHtml(surface.route)}</code> — ${escapeHtml(surface.reason)}</li>`,
    )
    .join('\n');
  return `<section>
<h2>Surfaces with no export target</h2>
<ul>${items}</ul>
</section>`;
}
