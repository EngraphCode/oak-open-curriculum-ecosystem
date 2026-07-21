/**
 * Git-location row composition for the Claude Code statusline.
 *
 * @remarks
 * Pure. Builds the checkout/branch/worktree/coordination rows from the gathered
 * {@link LocationParts}, including the reasoning-effort suffix on the row that
 * names the CURRENT checkout. Extracted from `statusline-segments.ts`, which
 * retains segment colouring and the row-set assembly.
 *
 * @packageDocumentation
 */

import { BOLD, BLUE, CYAN, DIM, RESET, HORIZONTAL_SEPARATOR, YELLOW } from './statusline-ansi.js';

/**
 * The location facts the rows are built from — the narrow slice of the full
 * segment parts this module needs, declared here so the dependency points one
 * way (segments imports location-rows, never the reverse).
 */
export interface LocationParts {
  /** Current workspace directory basename. */
  readonly dir: string;
  /** Current git branch (or short SHA), if inside a repository. */
  readonly branch: string | undefined;
  /** Whether the working tree has tracked or untracked changes. */
  readonly dirty: boolean;
  /** Linked-worktree name; absent in the main working tree. */
  readonly worktree: string | undefined;
  /** The shared coordination branch; `undefined` in a solo checkout. */
  readonly coordinationBranch: string | undefined;
  /** The primary checkout's display name beside the coordination branch. */
  readonly coordinationPlace: string | undefined;
  /** The live reasoning-effort level; `undefined` renders no segment. */
  readonly effortLevel: string | undefined;
}

const DIRTY_MARK = '*';
/** Label prefixing the primary checkout's branch when the session is in a worktree. */
const COORDINATION_LABEL = 'coord:';

/**
 * Build the git-location rows from the resolved parts.
 *
 * With no resolved coordination branch the session sits in the only relevant
 * checkout: its name on one row, its branch on the next (or just the name outside
 * a repository). With a coordination branch resolved the session sits in a linked
 * worktree, so three rows: the shared primary checkout's name, then its branch
 * prefixed `coord:`, then this worktree's name and branch together. The branch the
 * session is ON (the lone primary branch, or the worktree branch) is bold blue
 * (where you are); the primary-as-context coord branch is non-bold (where you are
 * not). The coordination branch resolves to a value exactly when linked worktrees
 * exist AND it diverges from the working branch — which, because git forbids the
 * same branch in two worktrees, distinguishes "in a worktree" from "in the
 * primary" reliably (see statusline-git-location.ts).
 */
export function buildLocationRows(parts: LocationParts): readonly string[] {
  if (parts.coordinationBranch === undefined) {
    return compactRows([
      withEffort(placeName(parts.dir), parts.effortLevel),
      formatBranch(parts.branch, parts.dirty),
    ]);
  }
  return compactRows([
    parts.coordinationPlace === undefined ? undefined : placeName(parts.coordinationPlace),
    `${DIM}${COORDINATION_LABEL}${RESET} ${formatContextBranch(parts.coordinationBranch)}`,
    withEffort(worktreeRow(parts), parts.effortLevel),
  ]);
}

/** This worktree's name and branch on one row; the name alone if the branch is unresolved. */
function worktreeRow(parts: LocationParts): string {
  const name = placeName(parts.worktree ?? parts.dir);
  const branch = formatBranch(parts.branch, parts.dirty);
  return branch === undefined ? name : `${name} ${branch}`;
}

/**
 * Append the reasoning-effort segment (`e:<level>`, DIM — session context, not a
 * location fact) to the row naming the CURRENT checkout; the row is unchanged
 * when no level was supplied.
 */
function withEffort(row: string, effortLevel: string | undefined): string {
  return effortLevel === undefined
    ? row
    : `${row}${HORIZONTAL_SEPARATOR}${DIM}e:${effortLevel}${RESET}`;
}

/** Drop absent or empty rows, preserving order. */
function compactRows(rows: readonly (string | undefined)[]): string[] {
  return rows.filter((row): row is string => row !== undefined && row.length > 0);
}

/**
 * Bold-blue working branch with a trailing dirty mark — the branch the session is
 * ON. The colour precedes BOLD: BLUE carries a leading reset (`0;`) that would
 * otherwise clear a preceding bold; the trailing RESET ends both attributes before
 * the dirty mark.
 */
function formatBranch(branch: string | undefined, dirty: boolean): string | undefined {
  if (branch === undefined) {
    return undefined;
  }
  const mark = dirty ? `${YELLOW}${DIRTY_MARK}${RESET}` : '';
  return `${BLUE}${BOLD}${branch}${RESET}${mark}`;
}

/**
 * A coordination/context branch in non-bold blue — the primary checkout's branch,
 * shown as context distinct from the bold working branch (which marks where the
 * session is).
 */
function formatContextBranch(branch: string): string {
  return `${BLUE}${branch}${RESET}`;
}

/** A checkout or worktree name in cyan, matching across the working and coordination rows. */
function placeName(name: string): string {
  return `${CYAN}${name}${RESET}`;
}
