/**
 * Pure renderer for the Claude Code statusline.
 *
 * @remarks
 * Assembles the Claude Code statusline from already-gathered values. Holds no
 * I/O: the imperative adapter (`statusline-identity.ts`) derives the agent
 * identity and gathers git state, then delegates formatting here so the layout
 * is unit-testable.
 *
 * Segment order puts the short, fixed-width segments (identity, model,
 * context %) first and the long, variable-width git segments last, so a narrow
 * terminal truncates the least important information first.
 *
 * @packageDocumentation
 */

/**
 * Segment values for a single statusline render. Each is optional; absent
 * segments are dropped and the rest joined with a separator.
 */
export interface StatuslineParts {
  /** Deterministic agent-identity display name (PDR-027). */
  readonly identity: string | undefined;
  /** Current workspace directory basename. */
  readonly dir: string;
  /** Current git branch (or short SHA), if inside a repository. */
  readonly branch: string | undefined;
  /** Whether the working tree has tracked or untracked changes. */
  readonly dirty: boolean;
  /** Linked-worktree name; absent in the main working tree. */
  readonly worktree: string | undefined;
  /** Claude Code context-window usage percentage. */
  readonly usedPercentage: number | undefined;
  /** Claude Code model display name. */
  readonly model: string | undefined;
}

const RESET = '\u001b[0m';
const DIM = '\u001b[2m';
const CYAN = '\u001b[0;36m';
const BOLD_BLUE = '\u001b[1;34m';
const GREEN = '\u001b[0;32m';
const RED = '\u001b[0;31m';
const YELLOW = '\u001b[0;33m';
const MAGENTA = '\u001b[0;35m';

const SEPARATOR = `${DIM} · ${RESET}`;
const DIRTY_MARK = '*';

/** Context usage below this percentage renders in green; from it, yellow. */
const CONTEXT_ELEVATED_PERCENT = 50;
/** Context usage from this percentage upwards renders in red. */
const CONTEXT_HIGH_PERCENT = 70;

/**
 * Assemble the statusline string from gathered segment values.
 *
 * @param parts - The resolved segment values.
 * @returns The ANSI-coloured statusline of the form
 *   `<identity> · <model> · ctx:N% · <branch>[*] · <dir or wt:name>`
 *   with absent segments dropped.
 *
 * @example
 * ```ts
 * renderStatusline({
 *   identity: 'Fragrant Creeping Sapling',
 *   dir: 'oak-wt-eef',
 *   branch: 'feat/eef-explore-evidence',
 *   dirty: true,
 *   worktree: 'oak-wt-eef',
 *   usedPercentage: 12,
 *   model: 'Opus 4.7',
 * });
 * // -> "<magenta>Fragrant... · Opus 4.7 · ctx:12% · feat/...* · wt:oak-wt-eef"
 * ```
 */
export function renderStatusline(parts: StatuslineParts): string {
  const segments: string[] = [];

  if (parts.identity !== undefined) {
    segments.push(`${MAGENTA}${parts.identity}${RESET}`);
  }
  if (parts.model !== undefined) {
    segments.push(`${DIM}${parts.model}${RESET}`);
  }
  if (parts.usedPercentage !== undefined) {
    segments.push(formatContext(parts.usedPercentage));
  }
  if (parts.branch !== undefined) {
    const dirty = parts.dirty ? `${YELLOW}${DIRTY_MARK}${RESET}` : '';
    segments.push(`${BOLD_BLUE}${parts.branch}${RESET}${dirty}`);
  }

  const place = parts.worktree === undefined ? parts.dir : `wt:${parts.worktree}`;
  segments.push(`${CYAN}${place}${RESET}`);

  return segments.join(SEPARATOR);
}

/** Format context usage, colour-coded as a glance-warning once it climbs. */
function formatContext(usedPercentage: number): string {
  const pct = Math.round(usedPercentage);
  const text = `ctx:${pct}%`;
  if (pct >= CONTEXT_HIGH_PERCENT) {
    return `${RED}${text}${RESET}`;
  }
  if (pct >= CONTEXT_ELEVATED_PERCENT) {
    return `${YELLOW}${text}${RESET}`;
  }
  return `${GREEN}${text}${RESET}`;
}
