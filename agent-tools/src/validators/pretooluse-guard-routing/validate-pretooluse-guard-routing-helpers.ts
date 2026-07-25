/**
 * Detect PreToolUse hook commands that invoke a dist-built guard directly
 * instead of routing through the verdict shim.
 *
 * The guards live in `agent-tools/dist` (gitignored, built on install). Invoking
 * them directly with `node <missing>.js` exits 1 — which Claude Code treats as a
 * non-blocking error, so a missing/broken guard would *silently* let the tool
 * call proceed unguarded. The shim `.claude/hooks/run-pretooluse-guard.mjs` takes
 * control of the verdict instead: fail closed (exit 2) for a built-but-broken
 * guard, deliberate loud-and-logged fail open for a not-yet-built one. This gate
 * prevents a silent revert to the direct-`node` form, which would reopen the
 * uncontrolled silent fail-open window.
 *
 * The helper is pure; the runtime that reads `.claude/settings.json` lives in
 * `validate-pretooluse-guard-routing.ts`.
 *
 * @packageDocumentation
 */

import { CLAUDE_HOOK_ARTEFACT } from '../portability/portability-constants.js';

/**
 * Substring identifying a command that runs a hook-policy dist artefact.
 *
 * Deliberately the FAMILY prefix rather than any artefact's basename: a
 * basename marker goes silently vacuous when the artefact is renamed (the
 * validator then matches nothing and prints OK forever). Any dist-built
 * hook-policy artefact, whatever its name, must route through the shim.
 */
export const GUARD_COMMAND_MARKER = 'dist/src/hook-policy/';

/** Substring identifying the shim a guard command must route through. */
export const GUARD_ROUTING_SHIM = '.claude/hooks/run-pretooluse-guard.mjs';

/**
 * The `PreToolUse` matchers that MUST each carry exactly one shim-routed
 * policy-dispatcher command. The non-vacuity half of this validator: routing
 * checks alone pass vacuously when a migration drops a matcher or renames the
 * artefact family, so presence is asserted per matcher as well.
 */
export const REQUIRED_POLICY_MATCHERS = ['Bash', 'Edit', 'Write'] as const;

/**
 * Return the PreToolUse command strings that run a dist guard directly without
 * routing through the shim.
 *
 * @param commands - PreToolUse hook command strings from `.claude/settings.json`.
 * @returns The offending commands, in input order. Empty when every guard
 *   command routes through the shim.
 *
 * @example
 *
 * ```ts
 * findUnroutedGuardCommands(['node ".../hook-policy/check-blocked-patterns.js"']);
 * // ['node ".../hook-policy/check-blocked-patterns.js"']  (direct → flagged)
 * ```
 */
export function findUnroutedGuardCommands(commands: readonly string[]): string[] {
  return commands.filter(
    (command) => command.includes(GUARD_COMMAND_MARKER) && !command.includes(GUARD_ROUTING_SHIM),
  );
}

/**
 * Return one defect line per required policy matcher that does not carry
 * exactly one shim-routed hook-policy dispatcher command.
 *
 * This is the validator's non-vacuity assertion: {@link findUnroutedGuardCommands}
 * alone passes an empty command set, so a migration that dropped a matcher or
 * renamed the artefact family out of {@link GUARD_COMMAND_MARKER}'s reach
 * would otherwise turn the gate into a silent OK.
 *
 * @param matcherCommands - Map from `PreToolUse` matcher name to that
 *   matcher's hook command strings, as read from `.claude/settings.json`.
 * @returns Human-readable defect lines, empty when every required matcher
 *   carries exactly one shim-routed dispatcher command.
 */
export function findPolicyMatcherDefects(
  matcherCommands: ReadonlyMap<string, readonly string[]>,
): string[] {
  return REQUIRED_POLICY_MATCHERS.flatMap((matcher) => {
    const commands = matcherCommands.get(matcher) ?? [];
    // Pins the EXACT dispatcher artefact, not the family prefix: any other
    // hook-policy module routed through the shim exits 0 with no stdout, which
    // the host reads as allow — so a family-prefix count would report a
    // neutered matcher as covered. Rename robustness lives in the shared
    // CLAUDE_HOOK_ARTEFACT constant (and its pinning tests), where a rename
    // that misses the constant fails loudly.
    const routed = commands.filter(
      (command) => command.includes(CLAUDE_HOOK_ARTEFACT) && command.includes(GUARD_ROUTING_SHIM),
    );
    if (routed.length === 1) {
      return [];
    }
    return [
      `matcher "${matcher}" carries ${routed.length} shim-routed hook-policy dispatcher command(s); exactly 1 required`,
    ];
  });
}
