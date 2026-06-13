/**
 * Pure renderer for the Claude Code statusline.
 *
 * @remarks
 * Assembles the Claude Code statusline from already-gathered values. Holds no
 * I/O: the imperative adapter (`statusline-identity.ts`) derives the agent
 * identity, gathers git state, and resolves the session-shape indicators, then
 * delegates formatting here so the layout is unit-testable.
 *
 * Segment order puts the short, fixed-width segments (identity, session-shape
 * indicators, model, context %) first and the long, variable-width git segments
 * last, so a narrow terminal truncates the least important information first.
 *
 * The session-shape indicators are glanceable coordination glyphs (a Director
 * demark on the identity, a team-shape icon, an ArcAngel wing) that sit with the
 * identity: the single-line layout keeps them as the second segment, the
 * four-row logo layout trails them on the identity row. With a logo style the
 * statusline renders as a four-row block (the Oak mark as a left logo-column,
 * segments to its right); without one (the default) it is the original line.
 *
 * @packageDocumentation
 */

import { OAK_LOGO_ROWS, type OakLogoStyle } from './oak-logo.js';
import { type SessionShape } from './statusline-session-shape.js';

/**
 * Segment values for a single statusline render. Each visible segment is
 * optional; absent segments are dropped and the rest joined with a separator.
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
  /**
   * Resolved session coordination shape (own role, team shape, ArcAngel
   * liveness); undefined when no shape was resolved for the tick, which renders
   * identically to a soloist with no live rapid channel — no indicators.
   */
  readonly sessionShape: SessionShape | undefined;
}

/** Optional presentation controls for {@link renderStatusline}. */
export interface StatuslineRenderOptions {
  /**
   * Glyph family for the Oak mark. `none` (the default) renders the original
   * single line; any other style renders the four-row logo-column layout.
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

/**
 * Session-shape indicator glyphs — all five verified in the owner's terminals
 * (2026-06-13): DIRECTOR_MARK, TEAM_DIRECTED_ICON, TEAM_PEER_ICON, TEAM_SOLO_ICON,
 * ARC_WING. The original peer glyph U+1F465 (busts) tofu'd and was replaced by
 * U+1F91D. ASCII fallbacks if a font regresses: `[D]` `[T]` `[P]` `[S]` `[A]`.
 */
const DIRECTOR_MARK = '\u{1F9ED}';
const TEAM_DIRECTED_ICON = '\u{1F46A}';
const TEAM_PEER_ICON = '\u{1F91D}';
const TEAM_SOLO_ICON = '\u{1F9CD}';
const ARC_WING = '\u{1FAB6}';

/** Context usage below this percentage renders in green; from it, yellow. */
const CONTEXT_ELEVATED_PERCENT = 50;
/** Context usage from this percentage upwards renders in red. */
const CONTEXT_HIGH_PERCENT = 70;

/**
 * Assemble the statusline from gathered segment values.
 *
 * @param parts - The resolved segment values.
 * @param options - Optional presentation controls (e.g. the Oak logo style).
 * @returns The ANSI-coloured statusline. Without a logo it is a single line
 *   (identity, then indicators, model, context, branch, place — absent segments
 *   dropped). With a logo it is four newline-separated rows: the Oak mark column
 *   with the segments to its right, the indicators trailing the identity on
 *   row 0.
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
 *   sessionShape: undefined,
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
    return joinPresent([
      seg.identity,
      seg.indicators,
      seg.model,
      seg.context,
      seg.branch,
      seg.place,
    ]);
  }

  // One entry per logo row (all styles are four rows); composeWithLogo drives
  // off the logo rows, so a row without text here renders as a bare mark. The
  // indicators trail the identity on row 0 — the coordination glyphs stay with
  // the agent name.
  const rowTexts = [
    joinPresent([seg.identity, seg.indicators]),
    seg.model ?? '',
    joinPresent([seg.context, seg.branch]),
    seg.place,
  ];
  return composeWithLogo(OAK_LOGO_ROWS[logo], rowTexts);
}

/** The ANSI-coloured statusline segments, each absent when its value is. */
interface Segments {
  readonly identity: string | undefined;
  readonly indicators: string | undefined;
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
    identity: formatIdentity(parts),
    indicators: formatSessionIndicators(parts.sessionShape),
    model: parts.model === undefined ? undefined : `${DIM}${parts.model}${RESET}`,
    context: parts.usedPercentage === undefined ? undefined : formatContext(parts.usedPercentage),
    branch: parts.branch === undefined ? undefined : `${BOLD_BLUE}${parts.branch}${RESET}${dirty}`,
    place: `${CYAN}${place}${RESET}`,
  };
}

/**
 * Format the identity segment, suffixing the Director demark when this session's
 * fresh claim carries the director role. Undefined identity drops the segment
 * (and the demark with it — a directorship needs an identity to resolve).
 */
function formatIdentity(parts: StatuslineParts): string | undefined {
  if (parts.identity === undefined) {
    return undefined;
  }
  const demark = parts.sessionShape?.ownRole === 'director' ? ` ${DIRECTOR_MARK}` : '';
  return `${MAGENTA}${parts.identity}${RESET}${demark}`;
}

/**
 * Map a resolved team shape to its glyph: `solo` shows its own marker; `unknown`
 * shows nothing (an unreadable surface reads as absence, never a false solo).
 */
function teamIcon(teamShape: SessionShape['teamShape']): string | undefined {
  if (teamShape === 'directed') {
    return TEAM_DIRECTED_ICON;
  }
  if (teamShape === 'peer') {
    return TEAM_PEER_ICON;
  }
  if (teamShape === 'solo') {
    return TEAM_SOLO_ICON;
  }
  return undefined;
}

/**
 * Format the team-shape icon and ArcAngel wing as one segment, or undefined
 * when there is nothing to show — only an unknown shape (or no resolved shape)
 * with no live channel renders blank; a confident solo carries its own marker.
 */
function formatSessionIndicators(shape: SessionShape | undefined): string | undefined {
  if (shape === undefined) {
    return undefined;
  }
  const team = teamIcon(shape.teamShape);
  const wing = shape.arcActive ? ARC_WING : undefined;
  const indicators = [team, wing].filter((glyph) => glyph !== undefined).join(' ');
  return indicators.length === 0 ? undefined : indicators;
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
