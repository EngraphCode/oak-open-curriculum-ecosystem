/**
 * Output formatters for the `session-metadata` topic (text + JSON).
 *
 * @remarks
 * Two modes only — human-readable text (default) and machine JSON (`--json`).
 * The JSON key order is fixed by the literal object construction so a future
 * edit cannot drift it silently.
 *
 * @packageDocumentation
 */

import type { SessionContextMetadata } from './compute.js';

/**
 * Full session-metadata report (the emitted shape): the computed context
 * metrics plus the request identity. Extends {@link SessionContextMetadata} so
 * a new metric field cannot silently drop out of the report.
 */
export interface SessionMetadataReport extends SessionContextMetadata {
  readonly vendor: string;
  readonly model: string;
  readonly sessionId: string;
}

/** Format a report as human-readable text (trailing newline). */
export function formatText(report: SessionMetadataReport): string {
  return (
    [
      `session    ${report.sessionId}`,
      `vendor     ${report.vendor}`,
      `model      ${report.model}`,
      `context    ${report.usedTokens} / ${report.windowTokens} tokens (${report.pctUsed}% used, ${report.pctRemaining}% remaining)`,
      `zone       ${report.zone}`,
      `advice     ${report.advice}`,
    ].join('\n') + '\n'
  );
}

/** Format a report as pretty-printed JSON (fixed key order, trailing newline). */
export function formatJson(report: SessionMetadataReport): string {
  return (
    JSON.stringify(
      {
        vendor: report.vendor,
        model: report.model,
        sessionId: report.sessionId,
        windowTokens: report.windowTokens,
        usedTokens: report.usedTokens,
        remainingTokens: report.remainingTokens,
        pctUsed: report.pctUsed,
        pctRemaining: report.pctRemaining,
        zone: report.zone,
        advice: report.advice,
      },
      null,
      2,
    ) + '\n'
  );
}
