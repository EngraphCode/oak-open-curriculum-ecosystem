/**
 * The canonical measurement widths as client-safe data (DDR-009). The
 * authoritative module is tools/measurement-widths.ts; a client module
 * cannot import its Node-flavoured dependencies, so the values are
 * mirrored here as data and the spec pins deep equality with the
 * canonical set so drift is loud (the ScaledFrame precedent).
 */
export const VIEWPORT_WIDTHS: readonly number[] = [320, 390, 768, 1024, 1440, 1920];

/** Owner-facing option labels: the width plus its warrant's short name,
 *  humanised from the canonical entries' labels. */
export const VIEWPORT_WIDTH_LABELS: Readonly<Record<string, string>> = {
  '320': '320 px — reflow floor',
  '390': '390 px — phone',
  '768': '768 px — tablet portrait',
  '1024': '1024 px — past the seam',
  '1440': '1440 px — design canvas',
  '1920': '1920 px — wide desktop',
};

/** The design-canvas cell — the default simulated viewport everywhere a
 *  frame opens (DDR-009's primary comparison cell). */
export const DEFAULT_VIEWPORT_WIDTH = 1440;
