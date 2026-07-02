import { err, ok, type Result } from '@oaknational/result';

import { findScopedBlockInText, type ScopedBlockMatch } from '../hook-policy/matchers.js';
import { POLICY_URL, loadScopedContentBlocks } from '../hook-policy/policy-loader.js';
import { type ScopedContentBlockGroup } from '../hook-policy/types.js';

/**
 * The PDR-044 concept gates that apply to the comms stream (owner-ratified
 * 2026-07-02). Comms is upstream of doctrine — consolidation copies comms
 * language into thread records, napkins, and plans, where the Edit/Write
 * hook then fights the contamination — so the same two concept families the
 * hook enforces on doctrine surfaces are enforced at the comms write path.
 *
 * Deliberately NOT gated on comms: `sha-in-permanent-doc` (comms events
 * legitimately cite commit SHAs constantly — they are coordination signal,
 * not permanent docs) and `menu-framing` / `machine-local-path` (path-scoped
 * concerns whose comms-side value has no ratified mandate). Widening this
 * list is a deliberate governance act, mirroring the hook policy's own
 * scope discipline.
 */
export const COMMS_GATED_CONCEPTS: readonly string[] = [
  'expediency-hedging',
  'indefinite-deferral',
];

/**
 * Tags whose events are exempt from the comms concept gates, by the
 * recursive-exclusion principle: a structural enforcer that names its own
 * pathogen must exclude the surfaces that define or correct the pathogen
 * (precedent: the hook policy's `exclude_paths` lets `principles.md` and
 * `no-hedging-vocabulary.md` catalogue the words they forbid). Tagged
 * `failure-mode` / `behaviour-note` events are the PDR-066 capture channel —
 * they legitimately QUOTE a trip-list phrase to correct it. This is a
 * principled exemption on the event's declared nature, not an override
 * flag: the tags are namespace-validated and visible to every watcher, so
 * mis-tagging to bypass the gate is observable on the stream.
 */
const COMMS_CONCEPT_GATE_EXEMPT_TAGS: ReadonlySet<string> = new Set([
  'failure-mode',
  'behaviour-note',
]);

/**
 * Select the comms-gated subset of the policy's scoped blocks by concept
 * name. The policy file remains the single source of truth for patterns,
 * citations, and reappraisals — this module never restates a list.
 */
export function selectCommsGatedBlocks(
  groups: readonly ScopedContentBlockGroup[],
): readonly ScopedContentBlockGroup[] {
  return groups.filter((group) => COMMS_GATED_CONCEPTS.includes(group.concept));
}

/**
 * Load the comms-gated concept blocks from the hook policy (the SSOT).
 */
export async function loadCommsConceptGateBlocks(
  policyUrl: URL = POLICY_URL,
): Promise<readonly ScopedContentBlockGroup[]> {
  return selectCommsGatedBlocks(await loadScopedContentBlocks(policyUrl));
}

/**
 * A concept-gate refusal: the scoped-block match that fired, carried as
 * typed data so the CLI boundary owns the translation to its own error
 * contract (ADR-088: the gate itself never throws).
 */
export type CommsConceptGateRefusal = ScopedBlockMatch;

/**
 * Render the teaching payload for a comms concept-gate refusal — the same
 * advisory shape the Edit/Write hook emits (PDR-044 §Innate immunity, as
 * amended: an enforcement surface must carry the advisory-response content,
 * not only a refusal).
 */
export function formatCommsConceptGateRefusal(refusal: CommsConceptGateRefusal): string {
  return [
    `comms concept gate: "${refusal.matchedText}" fires the ${refusal.group.concept} block.`,
    `Citation: ${refusal.group.citation}`,
    `Reappraisal: ${refusal.group.reappraisal}`,
    'If this event legitimately quotes the pathogen to CORRECT it (a PDR-066 capture), tag it failure-mode or behaviour-note — capture surfaces are exempt by the recursive-exclusion principle. Otherwise describe the coordination directly, without the exception-shape.',
  ].join('\n');
}

/**
 * Check a comms event's title and body against the gated concept blocks.
 * Events tagged as capture surfaces are exempt (see
 * {@link COMMS_CONCEPT_GATE_EXEMPT_TAGS}); everything else — narrative,
 * directed, reply, heartbeat — is gated uniformly. Returns a refusal as
 * typed data rather than throwing; the CLI write paths translate it at
 * their existing throw boundary.
 */
export function checkCommsTextAgainstConceptGates(input: {
  readonly title: string;
  readonly body: string;
  readonly tags?: readonly string[];
  readonly groups: readonly ScopedContentBlockGroup[];
}): Result<undefined, CommsConceptGateRefusal> {
  const tags = input.tags ?? [];
  if (tags.some((tag) => COMMS_CONCEPT_GATE_EXEMPT_TAGS.has(tag))) {
    return ok(undefined);
  }
  const match = findScopedBlockInText(`${input.title}\n${input.body}`, input.groups);
  return match === null ? ok(undefined) : err(match);
}
