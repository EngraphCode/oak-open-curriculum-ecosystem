/**
 * Pure CLI option parser for the `context-cost` topic.
 *
 * @remarks
 * `--glob` is a repeatable required value option; `--json` and `--help` are
 * flags. The scan mechanics are delegated to the shared {@link scanArgs}; this
 * module owns only the topic's option surface and the required-field check.
 * Returns a discriminated union (never throws, never exits, no IO).
 *
 * @packageDocumentation
 */

import { scanArgs, standardFlags, type ValueHandler } from '../core/cli-arg-parser.js';

interface ContextCostOptions {
  readonly globs: readonly string[];
  readonly json: boolean;
  readonly help: boolean;
}

export type ParseResult =
  | { readonly ok: true; readonly options: ContextCostOptions }
  | { readonly ok: false; readonly error: string };

interface MutableContextCostOptions {
  globs: string[];
  json: boolean;
  help: boolean;
}

const VALUE_OPTIONS = {
  '--glob': (state, value) => {
    state.globs.push(value);
  },
} satisfies Record<string, ValueHandler<MutableContextCostOptions>>;

export const CONTEXT_COST_HELP_TEXT = [
  'context-cost --glob <pattern> [--glob <pattern> ...] [--json]',
  '',
  'Estimate token cost over a fileset using the chars/4 baseline tokenizer.',
  'Token estimate is approximate (~10-15% accuracy band against real tokenizers',
  'for English-prose markdown). See .agent/analysis/practice-context-cost-baseline.md',
  'for methodology.',
  '',
  'Options:',
  '  --glob <pattern>   File glob to include. Repeatable. Required unless --help.',
  '  --json             Emit machine-readable JSON to stdout instead of tab-',
  '                     separated text. Warnings still go to stderr.',
  '  -h, --help         Show this help.',
  '',
  'Examples:',
  "  agent-tools context-cost --glob '.agent/rules/*.md'",
  "  agent-tools context-cost --glob '.agent/skills/**/SKILL.md' --glob '.agent/skills/**/SKILL-CANONICAL.md'",
  "  agent-tools context-cost --glob '.agent/rules/*.md' --json",
].join('\n');

export function parseArgs(argv: readonly string[]): ParseResult {
  const state: MutableContextCostOptions = {
    globs: [],
    json: false,
    help: false,
  };

  const scan = scanArgs(argv, state, {
    flags: standardFlags<MutableContextCostOptions>(),
    valueOptions: VALUE_OPTIONS,
    helpText: CONTEXT_COST_HELP_TEXT,
  });
  if (!scan.ok) {
    return { ok: false, error: scan.error };
  }

  if (state.help) {
    return { ok: true, options: state };
  }

  if (state.globs.length === 0) {
    return { ok: false, error: `--glob is required\n\n${CONTEXT_COST_HELP_TEXT}` };
  }

  return { ok: true, options: state };
}
