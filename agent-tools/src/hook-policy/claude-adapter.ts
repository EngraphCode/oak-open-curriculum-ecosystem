import { isJsonObject } from '../core/json.js';

import { extractBashCommand } from './blocked-patterns.js';
import type { PolicyRoute, PolicyRouteContext } from './dispatcher.js';
import { evaluateBashCommand, evaluateContentChanges, type PolicyDecision } from './evaluate.js';
import { extractContentChanges, resolveContentPair } from './hook-input.js';
import { unwrapPolicySection } from './policy-snapshot.js';
import type { ScopedContentBlockGroup } from './types.js';

/**
 * The three production PreToolUse routes for the Claude hook contract (which
 * Copilot CLI inherits).
 *
 * Matching is SHAPE-BASED everywhere; `tool_name` is never consulted — the
 * recorded regression fixtures include tool_name-less payloads on every
 * route. Each predicate mirrors the precondition of the existing tested
 * extraction function its route reuses, so a payload matches a route exactly
 * when that route's extraction can succeed structurally:
 *
 * - bash: any container in [`tool_input`, `toolInput`, root, `parameters`]
 *   is an object with a string `command` — `extractBashCommand`'s exact
 *   precondition, including the legacy container variants.
 * - claude-content: the container `resolveInput` would choose
 *   (`tool_input` object, then `toolInput` object, then root) carries a
 *   string `new_string` or string `content` — `extractContentChange`'s
 *   precondition.
 * - copilot-compat-string: `tool_input` is a string — the observed Copilot
 *   CLI inherited-hook shape (`extractContentChanges`' string arm). Patch
 *   validity is deliberately NOT part of the match: a malformed program must
 *   select this route and then fail closed in evaluation.
 *
 * Real payloads are disjoint across routes; synthetic payloads matching two
 * or more routes fail closed via the dispatcher's match count.
 *
 * @packageDocumentation
 */

/** True when a candidate container is an object carrying a string `command`. */
function containerHasCommand(container: unknown): boolean {
  return isJsonObject(container) && typeof container.command === 'string';
}

/** Shape predicate for the bash route — `extractBashCommand`'s precondition. */
function matchesBashShape(hookInput: unknown): boolean {
  if (!isJsonObject(hookInput)) {
    return false;
  }
  // Precedence-free ANY over the same container list extractBashCommand
  // probes: match asks "can the extraction succeed", not "which container".
  return [hookInput.tool_input, hookInput.toolInput, hookInput, hookInput.parameters].some(
    containerHasCommand,
  );
}

/** Whether one candidate container carries writable content. */
function containerHasWritableContent(container: unknown): boolean {
  return (
    isJsonObject(container) &&
    (typeof container.new_string === 'string' || typeof container.content === 'string')
  );
}

/**
 * Shape predicate for the content route — a deliberate SAFETY
 * OVER-APPROXIMATION of `extractContentChange`'s precondition.
 *
 * `resolveInput` (hook-input.ts) picks one container by precedence
 * (`tool_input` object, then `toolInput`, then the root), so a payload whose
 * chosen container lacks writable content makes extraction throw even when a
 * lower container carries `new_string`. Matching only the chosen container
 * would let such a payload fall to another route and be answered without any
 * content check; matching ANY container instead means it either fails closed
 * in extraction (one route matched) or fails closed on ambiguity (two routes
 * matched) — both the pre-unification behaviour. Over-approximating a
 * fail-closed predicate can only add refusals, never allowances.
 */
function matchesClaudeContentShape(hookInput: unknown): boolean {
  if (!isJsonObject(hookInput)) {
    return false;
  }
  return [hookInput.tool_input, hookInput.toolInput, hookInput].some(containerHasWritableContent);
}

/** Shape predicate for the compat route — `extractContentChanges`' string arm. */
function matchesCompatStringShape(hookInput: unknown): boolean {
  return isJsonObject(hookInput) && typeof hookInput.tool_input === 'string';
}

/**
 * Evaluate the payload as a Bash command: injected `bashPatterns` win, and
 * only an un-injected section touches the memoised snapshot.
 */
async function evaluateBashRoute(context: PolicyRouteContext): Promise<PolicyDecision> {
  const command = extractBashCommand(context.hookInput);
  const patterns =
    context.bashPatterns ?? unwrapPolicySection((await context.getSnapshot()).bashPatterns);
  return evaluateBashCommand(command, patterns);
}

/**
 * Resolve the two content policy sections through the injection overlay:
 * injected sections win, and the snapshot is consulted only when a needed
 * section is un-injected. Flat patterns unwrap before scoped blocks,
 * preserving the per-section load error precedence of the runner this
 * supersedes.
 */
async function resolveContentSections(context: PolicyRouteContext): Promise<{
  readonly patterns: readonly string[];
  readonly blocks: readonly ScopedContentBlockGroup[];
}> {
  if (context.contentPatterns !== undefined && context.scopedBlocks !== undefined) {
    return { patterns: context.contentPatterns, blocks: context.scopedBlocks };
  }
  const snapshot = await context.getSnapshot();
  const patterns = context.contentPatterns ?? unwrapPolicySection(snapshot.contentPatterns);
  const blocks = context.scopedBlocks ?? unwrapPolicySection(snapshot.scopedBlocks);
  return { patterns, blocks };
}

/**
 * Evaluate every content change the payload carries (a Claude object payload
 * yields one; a Copilot `apply_patch` program yields one per file section).
 * Extraction runs before any policy load so a malformed payload fails closed
 * without touching the snapshot — the runner's observable order.
 */
async function evaluateContentRoute(context: PolicyRouteContext): Promise<PolicyDecision> {
  const changes = extractContentChanges(context.hookInput).map((change) => {
    const { newContent, priorContent } = resolveContentPair(change, context.readPriorContent);
    return { newContent, priorContent, filePath: change.filePath };
  });
  const { patterns, blocks } = await resolveContentSections(context);
  return evaluateContentChanges(changes, patterns, blocks);
}

/** The Bash blocked-pattern route, covering all four recorded command containers. */
export const bashRoute: PolicyRoute = {
  name: 'bash',
  matches: matchesBashShape,
  evaluate: evaluateBashRoute,
};

/** The Claude Edit/Write object-payload content route. */
export const claudeContentRoute: PolicyRoute = {
  name: 'claude-content',
  matches: matchesClaudeContentShape,
  evaluate: evaluateContentRoute,
};

/**
 * The Copilot CLI inherited-hook compat route: `tool_input` as a raw
 * `apply_patch` program string (observed live 2026-07-25, CLI 1.0.75),
 * rendered through the Claude-compat renderer. Named so the Copilot vertical
 * extraction is a move, not a disentangle.
 */
export const copilotCompatStringRoute: PolicyRoute = {
  name: 'copilot-compat-string',
  matches: matchesCompatStringShape,
  evaluate: evaluateContentRoute,
};

/** The production route set, in stable declaration order. */
export const claudePolicyRoutes: readonly PolicyRoute[] = [
  bashRoute,
  claudeContentRoute,
  copilotCompatStringRoute,
];
