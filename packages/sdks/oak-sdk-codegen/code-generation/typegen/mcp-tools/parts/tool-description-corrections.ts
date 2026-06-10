/**
 * Tool description corrections for known-false upstream OpenAPI claims.
 *
 * The operation-level sibling of `param-description-overrides.ts`: each
 * correction replaces a sentence inside an operation description that is
 * wrong about the live API's behaviour. Corrections are keyed by
 * `{path}:{method}` and include the known-false upstream sentence so the
 * removal-condition test can detect when the upstream wording changes and
 * flag the correction for removal.
 *
 * @see upstream-tool-description-corrections.unit.test.ts — removal-condition test
 * @see tool-description.ts — `normaliseUpstreamDescription`, the shared transform
 */

/**
 * An operation-description correction replacing an upstream claim that is
 * observably false at the served surface.
 *
 * The operation-level sibling of `ParamDescriptionOverride` in
 * `param-description-overrides.ts`: a sentence inside the operation
 * description is replaced rather than a whole parameter description, because
 * operation descriptions mix correct scope-setting prose with the one false
 * claim.
 */
interface ToolDescriptionCorrection {
  /**
   * The exact known-false upstream sentence in pipeline-normalised form —
   * the output of `normaliseUpstreamDescription` (tool-description.ts) ("This endpoint" →
   * "This tool", whitespace collapsed, trimmed), which is the form the
   * replace operates on. The removal-condition test normalises the cached
   * upstream description with the same function before comparing, so the
   * two consumers of this value always see the same form.
   */
  readonly upstreamBuggySentence: string;
  /** The observed behaviour, stated truthfully in the upstream sentence's place. */
  readonly correctSentence: string;
}

/**
 * Map of `{openApiPath}:{method}` to operation-description corrections for
 * upstream claims the live API does not honour.
 *
 * Scope: corrections apply ONLY to the MCP tool description — the
 * agent-facing product surface this generator already transforms (see the
 * "This endpoint" → "This tool" rewrite and the appended notes). The
 * generated spec mirrors (`api-schema-*.json`, `api-paths-types.ts`, the Zod
 * schema descriptions) stay faithful to upstream by design: they record what
 * upstream says, and the upstream request tracking each divergence is the
 * cure at source.
 *
 * Lifecycle mirrors `PARAM_DESCRIPTION_OVERRIDES`: when the upstream spec
 * changes the sentence, the removal-condition test
 * (`upstream-tool-description-corrections.unit.test.ts`) fails, signalling
 * that the correction should be removed (or re-grounded against the new
 * wording). The generated-output drift-guard
 * (`generated-description-corrections.integration.test.ts`) independently
 * pins the served surface.
 *
 * `/keywords:get`: the upstream description promises frequency ordering, but
 * the handler sorts alphabetically and the response carries no frequency
 * field — verified first-hand against the live API (2026-06-10) and the
 * upstream handler source. Upstream request:
 * `.agent/plans/upstream-feature-requests/oak-open-api/keywords-finer-grained-control.md`.
 */
const TOOL_DESCRIPTION_CORRECTIONS: Readonly<
  Partial<Record<string, readonly ToolDescriptionCorrection[]>>
> = {
  '/keywords:get': [
    {
      upstreamBuggySentence:
        'The keywords are returned in order of frequency, with the most common keywords appearing first.',
      correctSentence:
        'The keywords are returned in alphabetical order, and the response carries no frequency field.',
    },
  ],
};

/**
 * Replaces known-false upstream claims in an operation's base description
 * with the observed behaviour.
 *
 * @param description - Base tool description from `toToolDescription`
 * @param path - OpenAPI path of the operation (corrections-map key, first half)
 * @param method - HTTP method of the operation (corrections-map key, second half)
 * @returns Description with corrections applied, or the original when the
 *   operation has no entry or the upstream sentence is no longer present
 */
export function applyDescriptionCorrections(
  description: string | undefined,
  path: string,
  method: string,
): string | undefined {
  if (!description) {
    return undefined;
  }

  const corrections = TOOL_DESCRIPTION_CORRECTIONS[`${path}:${method.toLowerCase()}`];
  if (!corrections) {
    return description;
  }

  return corrections.reduce(
    (corrected, correction) =>
      corrected.replace(correction.upstreamBuggySentence, correction.correctSentence),
    description,
  );
}

/**
 * Exported for the removal-condition test only.
 *
 * The test reads the schema cache and checks whether each correction's
 * `upstreamBuggySentence` still appears in the cached operation description.
 * When it no longer appears, the upstream wording has changed and the
 * correction must be removed or re-grounded.
 */
export { TOOL_DESCRIPTION_CORRECTIONS };
