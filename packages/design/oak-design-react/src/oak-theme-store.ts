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
 * The runtime also re-derives its default when the OS contrast preference
 * changes (oak-theme.js attaches its own `prefers-contrast` listener) but
 * exposes no change event, so the store mirrors that same media trigger and
 * re-notifies subscribers — runtime-driven changes reach React, not only
 * writes through the setters.
 *
 * The store is a factory (`createOakThemeStore`) with the runtime and
 * contrast-query resolvers injected, so tests build a store over simple
 * fakes instead of mutating globals (no-global-state-in-tests / ADR-078);
 * the app-wide instance below binds the real inlined runtime and the real
 * media query.
 *
 * This package's edge to `@oaknational/oak-design-system` is CONTRACT-ONLY:
 * `OakThemeRuntime` re-declares the runtime's public API verbatim (the kit
 * ships no type declarations, and the boundary rules bar a package import
 * in both directions — ADR-213 §3/§4). The interface below is the estate's
 * canonical `oakTheme` typing for consumers.
 */

export type OakThemeName = 'light' | 'dark' | 'system' | 'high-contrast' | 'colour-safe';
export type OakMotionMode = 'system' | 'reduced' | 'full';
/** The theme snapshot: an explicitly chosen theme, or '' when no explicit
 *  choice exists — the state where a brand's polarity default (or the OS
 *  contrast route) governs. A select pinned to a real value in that state
 *  would misreport the page AND make the first click on that value a dead
 *  control (selects only fire change when the value actually changes). */
export type OakThemeSnapshot = OakThemeName | '';

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
  themeOptions(): OakThemeName[];
  motionOptions(): OakMotionMode[];
}

/** The slice of MediaQueryList the store needs — injectable so tests pass a
 *  simple fake instead of stubbing the global matchMedia (a real
 *  MediaQueryList satisfies it structurally). */
export interface ContrastQuery {
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
}

function resolveGlobalContrastQuery(): ContrastQuery | undefined {
  return typeof globalThis.matchMedia === 'function'
    ? globalThis.matchMedia('(prefers-contrast: more)')
    : undefined;
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

/** Subscription with the contrast mirror built in: one shared media
 *  listener, attached with the first subscriber and detached with the last —
 *  the same query the runtime itself reacts to. */
function createContrastMirroringSubscribe(
  listeners: Set<Listener>,
  emit: () => void,
  resolveContrastQuery: () => ContrastQuery | undefined,
): OakThemeStore['subscribe'] {
  let contrastQuery: ContrastQuery | undefined;
  const onContrastChange = (): void => {
    emit();
  };
  return (listener: Listener): (() => void) => {
    if (listeners.size === 0) {
      contrastQuery = resolveContrastQuery();
      contrastQuery?.addEventListener('change', onContrastChange);
    }
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && contrastQuery !== undefined) {
        contrastQuery.removeEventListener('change', onContrastChange);
        contrastQuery = undefined;
      }
    };
  };
}

export function createOakThemeStore(
  resolveRuntime: () => OakThemeRuntime | undefined,
  resolveContrastQuery: () => ContrastQuery | undefined = resolveGlobalContrastQuery,
): OakThemeStore {
  const listeners = new Set<Listener>();
  const emit = (): void => {
    for (const listener of listeners) {
      listener();
    }
  };
  return {
    subscribe: createContrastMirroringSubscribe(listeners, emit, resolveContrastQuery),
    // Theme reads the CHOICE model through the runtime's own accessor. The
    // result is two-level by design: undefined = no runtime (the demos'
    // hydration gate), '' = runtime present but no explicit choice. The kit
    // returns null for no-choice; '' is this store's select-shaped spelling.
    // Motion needs no such split: the runtime's 'system' IS its no-choice
    // semantic (no attribute set).
    getTheme: () => {
      const runtime = resolveRuntime();
      if (runtime === undefined) {
        return undefined;
      }
      return runtime.choice() ?? '';
    },
    getMotion: () => resolveRuntime()?.motion.get() ?? undefined,
    getServerSnapshot: () => undefined,
    ...createSetters(resolveRuntime, emit),
    // Call contract: consumers read options only after the snapshot gate
    // (theme/motion defined ⇒ runtime present); pre-hydration placeholders
    // carry their own static option shapes. The fallbacks are a type-level
    // floor, not a rendered no-runtime path.
    themeOptions: () => resolveRuntime()?.themes ?? ['light'],
    motionOptions: () => resolveRuntime()?.motion.modes ?? ['system'],
  };
}

/** The app-wide store over the pre-paint inlined runtime. */
export const oakThemeStore: OakThemeStore = createOakThemeStore(() => globalThis.window?.oakTheme);
