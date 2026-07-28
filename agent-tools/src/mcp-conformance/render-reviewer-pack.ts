import { z } from 'zod';

import { type DriveOutcome, type DriveWitness } from './drive.js';

/**
 * Renders the reviewer walkthrough from one drive run (MCP-303): the pack
 * is a traceable projection of the run, so every claim in it — which tools
 * exist, what arguments exercise them, which could not be exercised and
 * why — comes from the recorded witnesses, never from prose.
 *
 * The outward-facing sentences (connection, credentials, the
 * same-curriculum-for-every-account note) are OWNER-GATED copy supplied by
 * the caller: this renderer structures, it does not author.
 */

export interface ReviewerPackPreamble {
  readonly connectionNote: string;
  readonly credentialsNote: string;
  readonly sameDataNote: string;
}

/** Boundary schema for a caller-supplied preamble file. */
export const reviewerPackPreambleSchema = z
  .object({
    connectionNote: z.string().min(1),
    credentialsNote: z.string().min(1),
    sameDataNote: z.string().min(1),
  })
  .strict();

/**
 * Visible placeholders for a draft pack run before the owner-approved copy
 * exists. Deliberately unmistakable in output — a draft pack must never
 * read as finished copy.
 */
export const PLACEHOLDER_PREAMBLE: ReviewerPackPreamble = {
  connectionNote: '[CONNECTION NOTE — owner-approved copy pending]',
  credentialsNote: '[CREDENTIALS NOTE — owner-approved copy pending]',
  sameDataNote: '[SAME-CURRICULUM-FOR-EVERY-ACCOUNT NOTE — owner-approved copy pending]',
};

/** Run provenance: when, with what instrument, and where the evidence lives. */
export interface ReviewerPackProvenance {
  readonly generatedAt: string;
  readonly vendorCliVersion: string;
  readonly reportDir: string;
}

export interface RenderReviewerPackInput {
  readonly target: string;
  readonly preamble: ReviewerPackPreamble;
  readonly outcome: DriveOutcome;
  readonly provenance: ReviewerPackProvenance;
}

export function renderReviewerPack(input: RenderReviewerPackInput): string {
  const header = [
    '# Oak Curriculum MCP — reviewer walkthrough',
    '',
    `Server: \`${input.target}\``,
    '',
    `Generated ${input.provenance.generatedAt} by \`agent-tools mcp-conformance --drive\` (\`@mcpjam/cli\` ${input.provenance.vendorCliVersion}); full run evidence under \`${input.provenance.reportDir}\`.`,
    '',
    input.preamble.connectionNote,
    '',
    input.preamble.credentialsNote,
    '',
    input.preamble.sameDataNote,
    '',
  ];
  if (input.outcome.listFailure !== undefined) {
    return [
      ...header,
      '## Walkthrough unavailable',
      '',
      `The tool list could not be obtained from the server: ${input.outcome.listFailure}`,
      '',
    ].join('\n');
  }
  const exercised = input.outcome.witnesses.filter((w) => w.outcome === 'called-ok');
  const sections = input.outcome.witnesses.flatMap((witness: DriveWitness) => {
    const invocation =
      witness.args === undefined
        ? []
        : [
            'Invocation arguments:',
            '',
            '```json',
            JSON.stringify(witness.args, null, 2),
            '```',
            '',
          ];
    const result =
      witness.outcome === 'called-ok'
        ? ['Exercised successfully against the live server.', '']
        : [`NOT exercised — ${witness.detail}`, ''];
    return [`### ${witness.toolName}`, '', ...invocation, ...result];
  });
  return [
    ...header,
    `## Tools (${exercised.length} of ${input.outcome.witnesses.length} tools exercised)`,
    '',
    ...sections,
  ].join('\n');
}
