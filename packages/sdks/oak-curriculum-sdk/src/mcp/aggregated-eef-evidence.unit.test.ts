import { describe, it, expect } from 'vitest';
import {
  EEF_STRAND_IDS,
  OBSERVED_PHASES,
  inspectStrand,
  evidenceForMove,
  evidenceForMoveHeadlines,
  type EefEvidenceEnvelope,
  type EefStrandHeadline,
} from '@oaknational/graph-corpus-sdk/eef-strands';
import { typeSafeKeys } from '../types/helpers/type-helpers.js';
import { OAK_CONTEXT_HINT } from './prerequisite-guidance.js';
import {
  GET_EEF_EVIDENCE_INPUT_SCHEMA,
  GET_EEF_EVIDENCE_TOOL_DEF,
  runEefEvidenceTool,
} from './aggregated-eef-evidence.js';
import { eefEvidenceToCallToolResult } from './eef-evidence-egress.js';

// The corpus is fixed `as const`, so these are non-empty by construction; the
// guard narrows them for the type checker and fails loudly if the corpus is
// ever emptied.
const firstStrandId = EEF_STRAND_IDS[0];
const firstPhase = OBSERVED_PHASES[0];
if (firstStrandId === undefined || firstPhase === undefined) {
  throw new Error('EEF corpus finite domains are unexpectedly empty');
}

/** Mirrors the tool's plural form for corpus-derived counts in expectations. */
function plural(count: number): string {
  return count === 1 ? '' : 's';
}

/**
 * The deterministic summary expected for an envelope — computed from the
 * same corpus binding the tool reads, never hard-coded counts.
 */
function expectedSummary(
  envelope: EefEvidenceEnvelope | EefEvidenceEnvelope<EefStrandHeadline>,
  detail: 'full' | 'headline',
): string {
  const members = envelope.members.length;
  const edges = envelope.edges.length;
  const frontier = envelope.frontier.length;
  return `EEF evidence (${envelope.answerType}): ${String(members)} ${detail} member strand${plural(members)}, ${String(edges)} related_strand edge${plural(edges)}, ${String(frontier)} frontier strand${plural(frontier)}.`;
}

describe('get-eef-evidence input schema (closed, finite domain)', () => {
  it('exposes exactly the dispatch field and the bounded-query selectors', () => {
    expect(typeSafeKeys(GET_EEF_EVIDENCE_INPUT_SCHEMA)).toEqual([
      'function',
      'strandId',
      'strandIds',
      'phase',
      'keyStage',
      'priority',
      'detail',
    ]);
  });
});

describe('runEefEvidenceTool (thin parse-and-dispatch over the D5 bindings)', () => {
  it('inspect-strand returns the binding envelope verbatim with its summary', () => {
    const result = runEefEvidenceTool({ function: 'inspect-strand', strandId: firstStrandId });
    if (result.isError) {
      throw new Error('expected a successful result');
    }
    const envelope = inspectStrand(firstStrandId);
    expect(result.envelope).toEqual(envelope);
    expect(result.summary).toBe(expectedSummary(envelope, 'full'));
  });

  it('evidence-for-move with an observed phase returns the matching envelope verbatim', () => {
    const expected = evidenceForMove({ phase: firstPhase });
    expect(expected.members.length).toBeGreaterThan(0);

    const result = runEefEvidenceTool({ function: 'evidence-for-move', phase: firstPhase });
    if (result.isError) {
      throw new Error('expected a successful result');
    }
    expect(result.envelope).toEqual(expected);
    expect(result.summary).toBe(expectedSummary(expected, 'full'));
  });

  it("evidence-for-move with detail:'headline' returns the bounded headline envelope", () => {
    const result = runEefEvidenceTool({
      function: 'evidence-for-move',
      phase: firstPhase,
      detail: 'headline',
    });
    if (result.isError) {
      throw new Error('expected a successful result');
    }
    const expected = evidenceForMoveHeadlines({ phase: firstPhase });
    expect(result.envelope).toEqual(expected);
    expect(result.summary).toBe(expectedSummary(expected, 'headline'));
  });

  it("evidence-for-move with detail:'full' returns the full strands (same as the default)", () => {
    const result = runEefEvidenceTool({
      function: 'evidence-for-move',
      phase: firstPhase,
      detail: 'full',
    });
    if (result.isError) {
      throw new Error('expected a successful result');
    }
    expect(result.envelope).toEqual(evidenceForMove({ phase: firstPhase }));
  });

  it('evidence-for-move defaults to the full strands when detail is omitted', () => {
    const result = runEefEvidenceTool({ function: 'evidence-for-move', phase: firstPhase });
    if (result.isError) {
      throw new Error('expected a successful result');
    }
    expect(result.envelope).toEqual(evidenceForMove({ phase: firstPhase }));
  });

  it('evidence-for-move with no selector is isError (an unscoped query is invalid)', () => {
    const result = runEefEvidenceTool({ function: 'evidence-for-move' });
    if (!result.isError) {
      throw new Error('expected an error result');
    }
    expect(result.content[0]?.text).toContain('at least one selector');
  });

  it('evidence-for-move with an empty strandIds array is isError (an empty explicit set is not a scope)', () => {
    const result = runEefEvidenceTool({ function: 'evidence-for-move', strandIds: [] });
    if (!result.isError) {
      throw new Error('expected an error result');
    }
    expect(result.content[0]?.text).toContain('at least one selector');
  });

  it('inspect-strand without a strandId is isError', () => {
    const result = runEefEvidenceTool({ function: 'inspect-strand' });
    if (!result.isError) {
      throw new Error('expected an error result');
    }
    expect(result.content[0]?.text).toContain("requires 'strandId'");
  });

  it('an unknown strand id is rejected by the schema parse (isError)', () => {
    const result = runEefEvidenceTool({
      function: 'inspect-strand',
      strandId: 'eef-tl-not-a-real-strand',
    });
    expect(result.isError).toBe(true);
  });
});

describe('get-eef-evidence tool definition', () => {
  it('carries the ratified title', () => {
    expect(GET_EEF_EVIDENCE_TOOL_DEF.title).toBe('EEF Evidence (Teaching and Learning Toolkit)');
  });
});

describe('eefEvidenceToCallToolResult (egress membrane — ADR-193, house dual shape)', () => {
  it('crosses a success envelope into the dual shape: summary + serialised JSON + decorated structuredContent', () => {
    const domain = runEefEvidenceTool({ function: 'inspect-strand', strandId: firstStrandId });
    const vendor = eefEvidenceToCallToolResult(domain);
    const envelope = inspectStrand(firstStrandId);
    const summary = expectedSummary(envelope, 'full');

    expect(vendor.isError).toBeUndefined();
    expect(vendor.content).toHaveLength(2);
    expect(vendor.content[0]).toEqual({ type: 'text', text: summary });

    const serialised = vendor.content[1];
    if (serialised?.type !== 'text') {
      throw new Error('expected content[1] to be the serialised-JSON text block');
    }
    expect(JSON.parse(serialised.text)).toEqual(envelope);

    expect(vendor.structuredContent).toEqual({
      ...envelope,
      summary,
      oakContextHint: OAK_CONTEXT_HINT,
      status: 'success',
    });

    expect(vendor._meta).toEqual({
      toolName: 'get-eef-evidence',
      'annotations/title': GET_EEF_EVIDENCE_TOOL_DEF.title,
    });
  });

  it('emits the dual shape for a headline evidence-for-move envelope', () => {
    const domain = runEefEvidenceTool({
      function: 'evidence-for-move',
      phase: firstPhase,
      detail: 'headline',
    });
    const vendor = eefEvidenceToCallToolResult(domain);
    const envelope = evidenceForMoveHeadlines({ phase: firstPhase });

    expect(vendor.content).toHaveLength(2);
    expect(vendor.content[0]).toEqual({
      type: 'text',
      text: expectedSummary(envelope, 'headline'),
    });
    expect(vendor.structuredContent).toMatchObject({ answerType: envelope.answerType });
  });

  it('pins the envelope keys so a future key cannot be clobbered by the decoration spread', () => {
    // formatToolResponse spreads summary/oakContextHint/status AFTER the
    // envelope. A future envelope key with one of those names would be
    // silently overwritten — this guard makes corpus-envelope growth loud.
    const envelope = inspectStrand(firstStrandId);
    expect(new Set(Object.keys(envelope))).toEqual(
      new Set(['answerType', 'edges', 'frontier', 'members', 'provenance']),
    );
  });

  it('passes an isError result through unchanged (no structuredContent on the error path)', () => {
    const domain = runEefEvidenceTool({ function: 'evidence-for-move' });
    const vendor = eefEvidenceToCallToolResult(domain);
    expect(vendor.isError).toBe(true);
    expect(vendor.structuredContent).toBeUndefined();
  });
});
