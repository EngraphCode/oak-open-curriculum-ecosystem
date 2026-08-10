/**
 * Thin external-store adapter over the design system's `oakTheme` runtime
 * (oak-theme.js, inlined pre-paint by the consuming app), shaped for React's
 * `useSyncExternalStore`: the runtime owns the state (localStorage + html
 * attributes); this module adds the change notification React needs to
 * re-render when a control writes through it. Server snapshots are undefined
 * by design — theme is client state, and server HTML stays theme-neutral.
 *
 * The theme snapshot is the CHOICE model, never the applied html attribute:
 * the runtime's automatic `prefers-contrast: more` path also writes
 * `data-theme`, so the applied attribute cannot distinguish an explicit
 * choice from an OS-triggered default. The store reads the runtime's
 * `choice()` accessor — the kit contract for exactly this distinction
 * (MCP-388) — and renders '' when no explicit choice exists.
 *
 * The store deliberately carries NO contrast-media mirror: under the choice
 * model the OS-contrast route changes only the APPLIED theme (the kit's
 * auto() path writes the attribute without touching choice()), so no
 * exposed snapshot can change and a re-notification would always bail out
 * of useSyncExternalStore. The hub's old mirror existed because its store
 * exposed the applied theme — the conflation the choice model cures. An
 * applied-theme surface (and its mirror) can land at first materialised
 * need as its own accessor.
 *
 * The store is a factory (`createOakThemeStore`) with the runtime resolver
 * injected, so tests build a store over a simple fake instead of mutating
 * globals (no-global-state-in-tests / ADR-078); the app-wide instance
 * below binds the real inlined runtime.
 *
 * This package's edge to `@oaknational/oak-design-system` is CONTRACT-ONLY
 * today: `OakThemeRuntime` re-declares the runtime's public API verbatim
 * (the kit ships no type declarations). The boundary rules PERMIT this
 * package's kit edge — the ADR-213 §4 tier edge, whose package import
 * materialises with the first component — and bar every other design-tier
 * import in both directions. The interface below is the estate's canonical
 * `oakTheme` typing for consumers.
 */

export type OakThemeName = 'light' | 'dark' | 'system' | 'high-contrast' | 'colour-safe';
export type OakMotionMode = 'system' | 'reduced' | 'full';
/** The theme snapshot: an explicitly chosen theme, or '' when no explicit
 *  choice exists — the state where a brand's polarity default (or the OS
 *  contrast route) governs. A select pinned to a real value in that state
 *  would misreport the page AND make the first click on that value a dead
 *  control (selects only fire change when the value actually changes). */
/** The applied theme (owner ruling 2026-08-10: the control displays what
 *  is APPLIED — the system default, an automatic contrast route, or an
 *  explicit choice — never a page-default sentinel). */
export type OakThemeSnapshot = OakThemeName;

/** The oakTheme runtime's public API, re-declared verbatim from
 *  `oak-design-system/src/oak-theme.ts` (contract-only edge — see the
 *  module docblock). */
export interface OakThemeRuntime {
  set(t: OakThemeName): void;
  get(): OakThemeName;
  choice(): OakThemeName | null;
  themes: OakThemeName[];
  motion: { set(m: OakMotionMode): void; get(): OakMotionMode; modes: OakMotionMode[] };
}

declare global {
  interface Window {
    oakTheme?: OakThemeRuntime;
  }
}

type Listener = () => void;

export interface OakThemeStore {
  subscribe(listener: Listener): () => void;
  getTheme(): OakThemeSnapshot | undefined;
  getMotion(): OakMotionMode | undefined;
  getServerSnapshot(): undefined;
  setTheme(theme: string): void;
  setMotion(mode: string): void;
  themeOptions(): OakThemeName[] | undefined;
  motionOptions(): OakMotionMode[] | undefined;
}

/** Setters narrow the select's string through the runtime's own lists — no
 *  assertion, and an unknown value (stale option, corruption) is a no-op
 *  exactly as the runtime itself treats it. */
function createSetters(
  resolveRuntime: () => OakThemeRuntime | undefined,
  emit: () => void,
): Pick<OakThemeStore, 'setTheme' | 'setMotion'> {
  return {
    setTheme: (theme: string): void => {
      const runtime = resolveRuntime();
      const next = runtime?.themes.find((t) => t === theme);
      if (next === undefined) {
        return;
      }
      runtime?.set(next);
      emit();
    },
    setMotion: (mode: string): void => {
      const runtime = resolveRuntime();
      const next = runtime?.motion.modes.find((m) => m === mode);
      if (next === undefined) {
        return;
      }
      runtime?.motion.set(next);
      emit();
    },
  };
}

export function createOakThemeStore(
  resolveRuntime: () => OakThemeRuntime | undefined,
): OakThemeStore {
  const listeners = new Set<Listener>();
  const emit = (): void => {
    for (const listener of listeners) {
      listener();
    }
  };
  return {
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    // Theme reads the APPLIED model through the runtime's get(): the system
    // default when nothing is chosen, the automatic contrast route when the
    // OS asks, the explicit choice once made (owner ruling 2026-08-10 —
    // there is no page-default state to display). undefined = no runtime
    // (the demos' hydration gate). Motion already worked this way:
    // 'system' IS its no-choice semantic.
    getTheme: () => resolveRuntime()?.get() ?? undefined,
    getMotion: () => resolveRuntime()?.motion.get() ?? undefined,
    getServerSnapshot: () => undefined,
    ...createSetters(resolveRuntime, emit),
    // Call contract: consumers read options only after the snapshot gate
    // (theme/motion defined ⇒ runtime present); pre-hydration placeholders
    // carry their own static option shapes. An absent runtime reads
    // undefined — the store fabricates no option values it cannot back.
    themeOptions: () => resolveRuntime()?.themes,
    motionOptions: () => resolveRuntime()?.motion.modes,
  };
}

/** The app-wide store over the pre-paint inlined runtime. */
export const oakThemeStore: OakThemeStore = createOakThemeStore(() => globalThis.window?.oakTheme);
