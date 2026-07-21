/**
 * Pure parsing and comparison helpers for the check↔CI parity validator.
 *
 * The validator recomputes both sides of the parity claim on every run
 * (never a recorded snapshot): the root `check` aggregate script is parsed
 * into its legs, the CI workflow text is parsed into the coverage it
 * actually provides, and the gap set is the difference. See
 * `validate-check-ci-parity.ts` for the composition root and the
 * structural-equivalence table.
 *
 * @packageDocumentation
 */

/** The legs a root `check` aggregate script is composed of. */
export interface CheckLegs {
  /** Root package scripts invoked as `pnpm <name>`. */
  readonly scripts: readonly string[];
  /** Turbo task names invoked via `turbo run <tasks…>`. */
  readonly turboTasks: readonly string[];
}

/** The coverage a CI workflow's run steps actually provide. */
export interface CiCoverage {
  /** Root package scripts appearing as `pnpm <name>` in any run step. */
  readonly scripts: ReadonlySet<string>;
  /** Turbo task names appearing in any `turbo run <tasks…>` invocation. */
  readonly turboTasks: ReadonlySet<string>;
}

/** One check leg with no CI coverage and no structural equivalence. */
export interface ParityGap {
  readonly kind: 'script' | 'turbo-task';
  readonly name: string;
}

/** Tokens after `pnpm` that introduce a subcommand, not a root script. */
const PNPM_NON_SCRIPT_TOKENS: ReadonlySet<string> = new Set(['exec', 'run', 'dlx']);

function isFlagOrAssignment(token: string): boolean {
  return token.startsWith('-') || token.includes('=');
}

function turboTasksFromSegment(segment: string): readonly string[] {
  const afterRun = segment.split(/\bturbo run\b/)[1];
  if (afterRun === undefined) {
    return [];
  }
  return afterRun
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0 && !isFlagOrAssignment(token));
}

function pnpmScriptFromSegment(segment: string): string | undefined {
  const tokens = segment.trim().split(/\s+/);
  if (tokens[0] !== 'pnpm') {
    return undefined;
  }
  const candidate = tokens[1];
  if (candidate === undefined || isFlagOrAssignment(candidate)) {
    return undefined;
  }
  if (PNPM_NON_SCRIPT_TOKENS.has(candidate)) {
    return undefined;
  }
  return candidate;
}

/**
 * Parse a root `check` aggregate script into its legs.
 *
 * Legs are the `&&`-joined segments: each is either a root script
 * invocation (`pnpm <name>`) or a turbo invocation (`turbo run <tasks…>`,
 * with or without a `pnpm exec` prefix). Flags are ignored.
 */
export function parseCheckLegs(checkScript: string): CheckLegs {
  const scripts: string[] = [];
  const turboTasks: string[] = [];

  for (const segment of checkScript.split('&&')) {
    const tasks = turboTasksFromSegment(segment);
    if (tasks.length > 0) {
      turboTasks.push(...tasks);
      continue;
    }
    const script = pnpmScriptFromSegment(segment);
    if (script !== undefined) {
      scripts.push(script);
    }
  }

  return { scripts, turboTasks };
}

const PNPM_INVOCATION_PATTERN = /\bpnpm\s+(?:-s\s+)?([A-Za-z0-9:._-]+)/g;

const TASK_NAME_PATTERN = /^[A-Za-z0-9:._-]+$/;

/** A YAML key token (`run:`, `name:`) ends the argument stream of a step. */
function isYamlKeyToken(token: string): boolean {
  return token.endsWith(':');
}

function collectTurboTasks(tokens: readonly string[], turboTasks: Set<string>): void {
  for (const token of tokens) {
    if (isYamlKeyToken(token) || !TASK_NAME_PATTERN.test(token)) {
      return;
    }
    if (!isFlagOrAssignment(token)) {
      turboTasks.add(token);
    }
  }
}

/**
 * Parse CI workflow text into the coverage its run steps provide.
 *
 * The scan is textual and token-based by design: it recomputes from the
 * live workflow files at every run (a removed or renamed step is a fresh
 * gap on the next validation, never a stale pass), and it walks the
 * whitespace-token stream so YAML folded scalars (`run: >-` blocks whose
 * arguments continue on later lines) are read whole. After `turbo run`,
 * tokens are consumed until the first YAML key token (`name:`) or
 * non-task token, which is where the step's argument stream ends.
 */
export function parseCiCoverage(workflowText: string): CiCoverage {
  const scripts = new Set<string>();
  const turboTasks = new Set<string>();

  for (const match of workflowText.matchAll(PNPM_INVOCATION_PATTERN)) {
    const token = match[1];
    if (token !== undefined && !PNPM_NON_SCRIPT_TOKENS.has(token) && !isFlagOrAssignment(token)) {
      scripts.add(token);
    }
  }

  const tokens = workflowText.split(/\s+/);
  for (let index = 0; index < tokens.length - 1; index += 1) {
    if (tokens[index] === 'turbo' && tokens[index + 1] === 'run') {
      collectTurboTasks(tokens.slice(index + 2), turboTasks);
    }
  }

  return { scripts, turboTasks };
}

/**
 * Compare check legs against CI coverage.
 *
 * A script leg is covered when CI runs it directly, or when it appears in
 * the structural-equivalence list (a named design decision in the
 * composition root, e.g. `clean` ≡ the fresh CI checkout). A turbo-task
 * leg is covered only when some CI `turbo run` invocation names it.
 */
export function findParityGaps(
  legs: CheckLegs,
  coverage: CiCoverage,
  structurallyEquivalentScripts: readonly string[],
): readonly ParityGap[] {
  const equivalences = new Set(structurallyEquivalentScripts);
  const gaps: ParityGap[] = [];

  for (const script of legs.scripts) {
    if (!coverage.scripts.has(script) && !equivalences.has(script)) {
      gaps.push({ kind: 'script', name: script });
    }
  }
  for (const task of legs.turboTasks) {
    if (!coverage.turboTasks.has(task)) {
      gaps.push({ kind: 'turbo-task', name: task });
    }
  }

  return gaps;
}
