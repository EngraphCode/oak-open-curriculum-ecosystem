/**
 * Shared ANSI palette for the Claude Code statusline.
 *
 * @remarks
 * The single owner of the colour vocabulary so the layout renderer
 * (`statusline-render.ts`) and the coordination-indicator formatter
 * (`statusline-indicators.ts`) share one source of truth rather than each
 * carrying a private copy that could drift. Codes use the `` (ESC)
 * escape so the bytes are unambiguous in source.
 *
 * @packageDocumentation
 */

export const RESET = '[0m';
export const DIM = '[2m';
export const CYAN = '[0;36m';
export const BOLD_BLUE = '[1;34m';
export const GREEN = '[0;32m';
export const RED = '[0;31m';
export const YELLOW = '[0;33m';
export const MAGENTA = '[0;35m';

/** The dim middot that joins present segments on one line. */
export const SEPARATOR = `${DIM} · ${RESET}`;
