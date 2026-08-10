/**
 * The canonical measurement widths as client-safe data (DDR-009). The
 * authoritative module is tools/measurement-widths.ts; a client module
 * cannot import its Node-flavoured dependencies, so the values are
 * mirrored here as data and the spec pins deep equality with the
 * canonical set so drift is loud (the ScaledFrame precedent).
 */
export const VIEWPORT_WIDTHS: readonly number[] = [320, 390, 768, 1024, 1280, 1440, 1920];

/** Owner-facing option labels: the width plus its warrant's short name,
 *  humanised from the canonical entries' labels. */
export const VIEWPORT_WIDTH_LABELS: Readonly<Record<string, string>> = {
  '320': '320 px — reflow floor',
  '390': '390 px — phone',
  '768': '768 px — tablet portrait',
  '1024': '1024 px — past the seam',
  '1280': '1280 px — switchboard canvas',
  '1440': '1440 px — design canvas',
  '1920': '1920 px — wide desktop',
};

/** The design-canvas cell — the side-by-side's simulated viewport
 *  (DDR-009's primary comparison cell). */
export const DEFAULT_VIEWPORT_WIDTH = 1440;

/** The export switchboard's framed canvas — the picker opens here so the
 *  two demos read identically side by side (DDR-009 dated amendment,
 *  2026-08-10: a same-width pair is the only fair visual comparison). */
export const SWITCHBOARD_CANVAS_WIDTH = 1280;
