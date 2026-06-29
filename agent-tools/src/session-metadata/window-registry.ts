/**
 * Model to context-window-size registry for the session-metadata topic.
 *
 * @remarks
 * The window size is keyed on the FULL model id including any variant marker
 * (e.g. `claude-opus-4-8[1m]` is the 1M-token variant; bare `claude-opus-4-8`
 * is the 200k default). The caller supplies the model id, so variant resolution
 * is the caller's concern, not this module's — there is no transcript sniffing
 * and no heuristic here. An unknown model returns `undefined`.
 *
 * @packageDocumentation
 */

const WINDOW_REGISTRY = new Map<string, number>([
  ['claude-opus-4-8', 200_000],
  ['claude-opus-4-8[1m]', 1_000_000],
  ['claude-opus-4-7', 200_000],
  ['claude-opus-4-7[1m]', 1_000_000],
  ['claude-opus-4-6', 200_000],
  ['claude-opus-4-6[1m]', 1_000_000],
  ['claude-sonnet-4-6', 200_000],
  ['claude-sonnet-4-6[1m]', 1_000_000],
  ['claude-haiku-4-5-20251001', 200_000],
  ['claude-fable-5', 200_000],
]);

/**
 * Resolve the context-window size in tokens for a full model id.
 *
 * @param model - Full model id including any variant marker (e.g. `[1m]`).
 * @returns The window size in tokens, or `undefined` for an unknown model.
 */
export function resolveWindowTokens(model: string): number | undefined {
  return WINDOW_REGISTRY.get(model);
}
