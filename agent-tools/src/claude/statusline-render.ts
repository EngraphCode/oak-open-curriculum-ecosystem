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
 * With a logo style the statusline renders as a three-row block: the Oak mark
 * forms a left logo-column and the segments flow to its right across the rows.
 * Without one (the default) it renders as the original single line.
 *
 * @packageDocumentation
 */

import { OAK_LOGO_ROWS, type OakLogoStyle } from './oak-logo.js';

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

/** Optional presentation controls for {@link renderStatusline}. */
export interface StatuslineRenderOptions {
  /**
   * Glyph family for the Oak mark. `none` (the default) renders the original
   * single line; any other style renders the three-row logo-column layout.
   */
  readonly logo?: OakLogoStyle;
}

const RESET = '[0m';
const DIM = '[2m';
const CYAN = '[0;36m';
const BOLD_BLUE = '[1;34m';
const GREEN = '[0;32m';
const RED = '[0;31m';
const YELLOW = '[0;33m';
const MAGENTA = '[0;35m';

const SEPARATOR = `${DIM} · ${RESET}`;
const DIRTY_MARK = '*';
/** Gap between the logo column and the segment text, in the multi-row layout. */
const LOGO_GAP = '  ';

/** Context usage below this percentage renders in green; from it, yellow. */
const CONTEXT_ELEVATED_PERCENT = 50;
/** Context usage from this percentage upwards renders in red. */
const CONTEXT_HIGH_PERCENT = 70;

/**
 * Assemble the statusline from gathered segment values.
 *
 * @param parts - The resolved segment values.
 * @param options - Optional presentation controls (e.g. the Oak logo style).
 * @returns The ANSI-coloured statusline. Without a logo it is a single line of
 *   the form `<identity> · <model> · ctx:N% · <branch>[*] · <dir or wt:name>`
 *   with absent segments dropped. With a logo it is three newline-separated
 *   rows: the Oak mark column followed by the segments distributed across rows.
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
export function renderStatusline(
  parts: StatuslineParts,
  options: StatuslineRenderOptions = {},
): string {
  const seg = buildSegments(parts);
  const logo = options.logo ?? 'none';
  if (logo === 'none') {
    return joinPresent([seg.identity, seg.model, seg.context, seg.branch, seg.place]);
  }

  // One entry per logo row (all styles are three rows); composeWithLogo drives
  // off the logo rows, so a row without text here renders as a bare mark.
  const rowTexts = [
    joinPresent([seg.identity, seg.model]),
    joinPresent([seg.context, seg.branch]),
    seg.place,
  ];
  return composeWithLogo(OAK_LOGO_ROWS[logo], rowTexts);
}

/** The ANSI-coloured statusline segments, each absent when its value is. */
interface Segments {
  readonly identity: string | undefined;
  readonly model: string | undefined;
  readonly context: string | undefined;
  readonly branch: string | undefined;
  readonly place: string;
}

/** Format each {@link StatuslineParts} value into its coloured segment. */
function buildSegments(parts: StatuslineParts): Segments {
  const dirty = parts.dirty ? `${YELLOW}${DIRTY_MARK}${RESET}` : '';
  const place = parts.worktree === undefined ? parts.dir : `wt:${parts.worktree}`;
  return {
    identity: parts.identity === undefined ? undefined : `${MAGENTA}${parts.identity}${RESET}`,
    model: parts.model === undefined ? undefined : `${DIM}${parts.model}${RESET}`,
    context: parts.usedPercentage === undefined ? undefined : formatContext(parts.usedPercentage),
    branch: parts.branch === undefined ? undefined : `${BOLD_BLUE}${parts.branch}${RESET}${dirty}`,
    place: `${CYAN}${place}${RESET}`,
  };
}

/** Join the present segments with the separator, dropping `undefined` ones. */
function joinPresent(segments: readonly (string | undefined)[]): string {
  return segments.filter((segment): segment is string => segment !== undefined).join(SEPARATOR);
}

/**
 * Compose the logo rows with the per-row segment text. Each logo row always
 * renders (the mark stays whole); the gap and text are appended only when that
 * row has segment text.
 */
function composeWithLogo(logoRows: readonly string[], rowTexts: readonly string[]): string {
  return logoRows
    .map((logoRow, index) => {
      const mark = `${GREEN}${logoRow}${RESET}`;
      const text = rowTexts[index] ?? '';
      return text.length > 0 ? `${mark}${LOGO_GAP}${text}` : mark;
    })
    .join('\n');
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
