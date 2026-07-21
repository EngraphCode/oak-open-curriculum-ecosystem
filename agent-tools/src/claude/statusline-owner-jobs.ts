/**
 * Owner-attention indicator for the Claude Code statusline.
 *
 * @remarks
 * The owner-jobs register (`.agent/state/collaboration/owner-jobs.md`,
 * untracked-by-design) is the estate's visible queue of items awaiting the
 * owner — created after the 2026-07-21 owner ruling that an attention item
 * recorded only in files the owner never reads is NOT surfaced ("'card'
 * means card UI, not some abstract invisible box of intent"). This module
 * is the glanceable half of that cure: the statusline renders a bell and
 * the open-job count whenever the register carries open items. Pure —
 * the adapter reads the file and passes the content in.
 *
 * @packageDocumentation
 */

import { BOLD, RESET, YELLOW } from './statusline-ansi.js';

/** The attention bell (U+1F514); ASCII fallback `[!]` if a font regresses. */
const ATTENTION_BELL = '\u{1F514}';

/** A job entry's state line, e.g. `- state: open` (trailing annotation allowed). */
const OPEN_STATE_LINE = /^\s*-\s*state:\s*open\b/;

/** The generated header's link line; https only — the value lands in an OSC 8 escape. */
const LINK_LINE = /^\s*link:\s*(https:\/\/\S+)\s*$/m;

/** OSC 8 hyperlink delimiters (open carries the URL; close is empty). */
const OSC8_CLOSE = '\x1b]8;;\x1b\\';

/**
 * Count the open jobs in the owner-jobs register content.
 *
 * @param fileContent - The register's raw markdown; undefined when the file
 *   is absent or unreadable (renders as zero — no register, no bell).
 * @returns The number of `- state: open` entries.
 */
export function countOpenOwnerJobs(fileContent: string | undefined): number {
  if (fileContent === undefined) {
    return 0;
  }
  return fileContent.split('\n').filter((line) => OPEN_STATE_LINE.test(line)).length;
}

/**
 * Format the owner-attention segment: the bell and the open count, loud
 * (bold yellow), or undefined when nothing awaits the owner — silence is
 * the honest default, the bell only ever means "the register has open
 * items for you".
 */
export function formatOwnerAttention(
  openCount: number | undefined,
  linkUrl?: string,
): string | undefined {
  if (openCount === undefined || openCount === 0) {
    return undefined;
  }
  const styled = `${YELLOW}${BOLD}${ATTENTION_BELL}${String(openCount)}${RESET}`;
  if (linkUrl === undefined) {
    return styled;
  }
  return `\x1b]8;;${linkUrl}\x1b\\${styled}${OSC8_CLOSE}`;
}

/**
 * Read the register header's `link:` line — the per-user issue-list URL the
 * bell opens, derived at render time from the same Linear viewer identity as
 * the queue owner's name. https only: the value is embedded in a terminal
 * OSC 8 escape, so any other scheme is rejected rather than emitted.
 */
export function parseOwnerJobsLink(fileContent: string | undefined): string | undefined {
  if (fileContent === undefined) {
    return undefined;
  }
  const match = LINK_LINE.exec(fileContent);
  return match?.[1];
}
