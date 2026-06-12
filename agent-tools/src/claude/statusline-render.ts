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

import { type SessionShape } from './statusline-session-shape.js';

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
  /**
   * Resolved session-coordination shape; undefined when the resolution was
   * unavailable for the tick (renders identically to a solo session with no
   * live rapid channel).
   */
  readonly sessionShape: SessionShape | undefined;
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

// Session-shape indicator glyphs. Rendering evidence recorded 2026-06-12
// (owner screenshots, three terminals — iTerm2, Terminal.app, VS Code
// terminal): each renders as a clean single glyph with no tofu, no
// fragmentation, and no separator overlap. All four are single codepoints
// by design — ZWJ sequences (e.g. the composed family emoji) fragment in
// mono fonts. ASCII fallback set if a future target mangles one:
// [D] director, [T] team shape, [A] arc.
/** Director demark, suffixed to the identity segment (compass, U+1F9ED). */
const DIRECTOR_MARK = '\u{1F9ED}';
/** Directed-team icon (family, U+1F46A). */
const TEAM_DIRECTED_ICON = '\u{1F46A}';
/** Peer-team icon (busts in silhouette, U+1F465). */
const TEAM_PEER_ICON = '\u{1F465}';
/** ArcAngel-active wing (feather, U+1FAB6). */
const ARC_WING = '\u{1FAB6}';

/** Context usage below this percentage renders in green; from it, yellow. */
const CONTEXT_ELEVATED_PERCENT = 50;
/** Context usage from this percentage upwards renders in red. */
const CONTEXT_HIGH_PERCENT = 70;

/**
 * Assemble the statusline string from gathered segment values.
 *
 * @param parts - The resolved segment values.
 * @returns The ANSI-coloured statusline of the form
 *   `<identity>[ 🧭] · [👪|👥][ 🪶] · <model> · ctx:N% · <branch>[*] · <dir or wt:name>`
 *   with absent segments dropped. The session-shape indicators sit inside
 *   the fixed-width prefix so narrow terminals never truncate them: the
 *   Director demark suffixes the identity, the team-shape icon renders for
 *   directed/peer windows (nothing when solo), and the ArcAngel wing
 *   appends while a rapid channel naming this agent is live.
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
export function renderStatusline(parts: StatuslineParts): string {
  const segments: string[] = [];

  const identity = formatIdentity(parts);
  if (identity !== undefined) {
    segments.push(identity);
  }
  const indicators = formatSessionIndicators(parts.sessionShape);
  if (indicators !== undefined) {
    segments.push(indicators);
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

/**
 * Format the identity segment, suffixing the Director demark when this
 * session's fresh claim carries the director role. Undefined identity drops
 * the segment (and with it the demark — a directorship cannot be resolved
 * without an identity in the first place).
 */
function formatIdentity(parts: StatuslineParts): string | undefined {
  if (parts.identity === undefined) {
    return undefined;
  }
  const demark = parts.sessionShape?.ownRole === 'director' ? ` ${DIRECTOR_MARK}` : '';
  return `${MAGENTA}${parts.identity}${RESET}${demark}`;
}

/**
 * Format the team-shape icon and ArcAngel wing as one segment, or undefined
 * when there is nothing to show (solo with no live rapid channel, or no
 * resolved shape for the tick — the two render identically by design).
 */
function formatSessionIndicators(shape: SessionShape | undefined): string | undefined {
  if (shape === undefined) {
    return undefined;
  }
  const team =
    shape.teamShape === 'directed'
      ? TEAM_DIRECTED_ICON
      : shape.teamShape === 'peer'
        ? TEAM_PEER_ICON
        : undefined;
  const wing = shape.arcActive ? ARC_WING : undefined;
  const indicators = [team, wing].filter((glyph) => glyph !== undefined).join(' ');
  return indicators.length === 0 ? undefined : indicators;
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
